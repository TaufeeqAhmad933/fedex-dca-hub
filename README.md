**DigiRecoverer**

Enterprise-Grade Intelligent Debt Collection & Governance Platform

Developed for FedEx SMART Hackathon | Team Synergy

**Executive Summary**:

DigiRecoverer is an end-to-end digital ecosystem designed to replace the manual, opaque, and fragmented processes of managing external Debt Collection Agencies (DCAs).
Addressing the critical challenges of delayed recoveries, weak governance, and limited scalability, DigiRecoverer leverages Artificial Intelligence, Predictive Scoring, and Process Automation to bridge the gap between FedEx Enterprise teams and external agencies.

**Value Proposition:** By automating debt segmentation and prioritizing cases based on AI probability scores, DigiRecoverer aims to save significant amount of firm's costs while ensuring strict SLA compliance and data security.

The system follows a scalable, multi-tier architecture designed to integrate seamlessly with existing Finance ERPs.

**System Architecture:**

![FedEx DCA Architecture](docs/IIT_Madras.drawio.svg)



**1. Data Ingestion & Validation Layer**
• Automated shortlisting of debts:

• To overcome manual excel uploads for shortlisting debts; we have incorporated APIs and Data Feed which were 
linked to Finance ERP (Accounts Receivable module) and Billing / Invoicing systems of FedEx.

• AI driven bot (robot) can be directly integrated into the legacy systems to fetch invoice details.

**• Debt shortlisting criteria:**

• Overdue beyond configured grace period

• Net outstanding amount > threshold

• Payment promise breached

• No dispute / legal / compliance hold / no active collection

**2. The Intelligence Core (Scoring Engine)**

Once shortlisted, data is passed through our dual-scoring engine to determine the optimal recovery strategy.

Logic A: Customer Ranking (PPS): Quantifies the likelihood of a customer paying.

Logic B: Agency Ranking (DPS): Quantifies which Agency is best suited for the job.

![Weighted Logic PPS, DPS](docs/Weighted_Logic_PPS,_DPS.png)





