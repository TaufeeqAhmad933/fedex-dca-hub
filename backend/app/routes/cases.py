from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..ml.pps_model import predict_pps
from ..data.dummy_data import get_dummy_cases
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from dotenv import load_dotenv
import io
import csv
import smtplib  # Added for dummy email sending
from email.mime.text import MIMEText  # Added for email formatting
import requests  # Added for dummy API integration

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # Configure Gemini

router = APIRouter()

@router.get("/cases")
def get_cases():
    cases = get_dummy_cases()
    for i, case in enumerate(cases):
        if i < 5:  # Force first 5 to be Loyal Forgetters
            case['pps'] = 95
            case['tier'] = "Loyal Forgetter"
            case['email_sent_date'] = None  # Track email send date
            case['assigned_to_agent'] = False
        else:
            case_data = {
                'account_age': case['account_age'],
                'amount_owed': case['amount_owed'],
                'payment_history': case['payment_history'],
                'location': case['location'],
                'shipment_frequency': case['shipment_frequency']
            }
            pps = predict_pps(case_data)
            case['pps'] = pps
            if pps >= 90:
                case['tier'] = "Loyal Forgetter"
            elif pps <= 30:
                case['tier'] = "Tier 1"
            elif pps <= 60:
                case['tier'] = "Tier 2"
            else:
                case['tier'] = "Tier 3"
        # Ageing and SLA
        if case['account_age'] <= 30:
            case['ageing_bucket'] = "0-30 days"
        elif case['account_age'] <= 60:
            case['ageing_bucket'] = "31-60 days"
        else:
            case['ageing_bucket'] = "60+ days"
        case['sla_breach'] = case['account_age'] > 30
        # Integration with Real APIs: Simulate FedEx shipment status
        try:
            response = requests.get(f'https://jsonplaceholder.typicode.com/posts/{case["id"]}')  # Dummy API
            case['shipment_status'] = response.json().get('title', 'In Transit')[:20]  # Truncate for display
        except:
            case['shipment_status'] = 'Unknown'
    return cases

@router.get("/cases/{agent_id}")
def get_cases_for_agent(agent_id: str):
    cases = get_cases()
    # Exclude Loyal Forgetters
    cases = [c for c in cases if c['tier'] != "Loyal Forgetter"]
    # Divide equally (e.g., Agent 1 gets even indices, Agent 2 gets odd)
    if agent_id == "agent1":
        assigned_cases = cases[::2]  # Every other case starting from 0
    elif agent_id == "agent2":
        assigned_cases = cases[1::2]  # Every other case starting from 1
    else:
        assigned_cases = []
    return assigned_cases

@router.get("/kpis")
def get_kpis():
    cases = get_cases()
    total_cases = len(cases)
    avg_pps = sum(c['pps'] for c in cases) / total_cases
    sla_compliance = sum(1 for c in cases if not c['sla_breach']) / total_cases * 100
    recoveries = sum(1 for c in cases if c['tier'] == "Loyal Forgetter")  # Simulate recoveries
    return {
        "total_cases": total_cases,
        "average_pps": round(avg_pps, 2),
        "sla_compliance_percent": round(sla_compliance, 2),
        "estimated_recoveries": recoveries
    }

@router.get("/export-csv")
def export_csv():
    cases = get_cases()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=cases[0].keys())
    writer.writeheader()
    writer.writerows(cases)
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode('utf-8')), media_type='text/csv', headers={"Content-Disposition": "attachment; filename=cases.csv"})

@router.post("/generate-email")
def generate_email(case: dict):
    if case.get('tier') != "Loyal Forgetter":
        raise HTTPException(status_code=400, detail="Only for Loyal Forgetters")
    prompt = f"Generate a friendly, personalized email reminder for a FedEx customer named {case['name']} who owes ${case['amount_owed']}. They have {case['shipment_frequency']} shipments and are in {case['location']}. Include a payment link: https://fedex.com/pay/{case['id']}. Add: 'You can call to this number 123456789 for any queries.' and 'Here is the link through which you can directly make your payment: https://fedex.com/pay/{case['id']}'. Keep it short and polite."
    try:
        # Use Gemini for generation with updated model
        model = genai.GenerativeModel('gemini-2.5-flash')  # Updated model name
        response = model.generate_content(prompt)
        email_body = response.text.strip()
        
        # Dummy send: Simulate sending via SMTP (use local dummy server for testing)
        msg = MIMEText(email_body)
        msg['Subject'] = f"FedEx Payment Reminder for {case['name']}"
        msg['From'] = 'noreply@fedex.com'
        msg['To'] = 'test@example.com'  # Dummy recipient
        
        # Connect to dummy SMTP server (run 'python -m smtpd -n -c DebuggingServer localhost:1025' in another terminal to log)
        server = smtplib.SMTP('localhost', 1025)
        server.sendmail('noreply@fedex.com', 'test@example.com', msg.as_string())
        server.quit()
        
        return {"email": email_body, "status": "Sent to test@example.com"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/calculate-pps")
def calculate_pps(case: dict):
    try:
        pps = predict_pps(case)
        tier = "Loyal Forgetter" if pps >= 90 else ("Tier 1" if pps <= 30 else "Tier 2" if pps <= 60 else "Tier 3")
        return {"pps": pps, "tier": tier}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-conversation")
def generate_conversation(case: dict):
    prompt = f"Generate a polite conversation script for a DCA agent talking to FedEx customer {case['name']} (PPS: {case['pps']}%, Tier: {case['tier']}). Respect rules: Be empathetic, mention payment options, avoid aggressive tactics. Keep it short."
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        script = response.text.strip()
        return {"script": script}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/analyze-call")
def analyze_call(data: dict):
    transcript = data.get('transcript', '')
    prompt = f"Analyze this call transcript for sentiment, compliance with FedEx rules, and recovery potential: {transcript}"
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        analysis = response.text.strip()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/analyze-email")
def analyze_email(data: dict):
    email_text = data.get('email', '')
    prompt = f"Analyze this email for sentiment, key points, and suggested actions: {email_text}"
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        analysis = response.text.strip()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/predict-recovery")
def predict_recovery(case: dict):
    prompt = f"Predict the recovery likelihood and timeline for this FedEx case: PPS {case['pps']}%, Tier {case['tier']}, Ageing {case['ageing_bucket']}. Provide a short summary."
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        prediction = response.text.strip()
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/send-loyal-email")
def send_loyal_email(data: dict):  # Changed to accept dict
    case_id = data.get('case_id')
    if not case_id:
        raise HTTPException(status_code=400, detail="case_id required")
    
    # Get case details
    cases = get_cases()
    case = next((c for c in cases if c['id'] == case_id), None)
    if not case or case['tier'] != "Loyal Forgetter":
        raise HTTPException(status_code=400, detail="Invalid case")
    
    # Generate email draft using Gemini
    prompt = f"Generate a friendly, personalized email reminder for a FedEx customer named {case['name']} who owes ${case['amount_owed']}. They have {case['shipment_frequency']} shipments and are in {case['location']}. Include a payment link: https://fedex.com/pay/{case['id']}. Add: 'You can call to this number 123456789 for any queries.' and 'Here is the link through which you can directly make your payment: https://fedex.com/pay/{case['id']}'. Keep it short and polite."
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        email_body = response.text.strip()
        
        # Dummy send: Simulate sending via SMTP (use local dummy server for testing)
        msg = MIMEText(email_body)
        msg['Subject'] = f"FedEx Payment Reminder for {case['name']}"
        msg['From'] = 'noreply@fedex.com'
        msg['To'] = 'test@example.com'  # Dummy recipient
        
        # Connect to dummy SMTP server (run 'python -m smtpd -n -c DebuggingServer localhost:1025' in another terminal to log)
        server = smtplib.SMTP('localhost', 1025)
        server.sendmail('noreply@fedex.com', 'test@example.com', msg.as_string())
        server.quit()
        
        return {"message": f"Email sent for Loyal Forgetter Case {case_id}", "sent_date": datetime.now().isoformat(), "email_draft": email_body}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@router.post("/assign-loyal-to-agent")
def assign_loyal_to_agent(case_id: int):
    # Simulate assignment
    return {"message": f"Case {case_id} assigned to agent"}