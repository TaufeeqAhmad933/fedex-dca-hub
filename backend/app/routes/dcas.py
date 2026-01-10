from fastapi import APIRouter
from ..ml.dca_model import predict_dps
from ..data.dummy_data import get_dummy_dcas

router = APIRouter()

@router.get("/dcas")
def get_dcas():
    dcas = get_dummy_dcas()
    for dca in dcas:
        dca["dps"] = predict_dps({
            "recovery_rate": dca["recovery_rate"],
            "sla_compliance": dca["sla_compliance"],
            "closure_time": dca["closure_time"],
            "feedback_score": dca["feedback_score"]
        })
        dca["tier"] = "Tier 1" if dca["dps"] >= 70 else "Tier 2" if dca["dps"] >= 35 else "Tier 3"
    return dcas