# Simple in-memory "database" for demo (use MongoDB/PostgreSQL in production)
cases_db = []
dcas_db = []

def init_db():
    from ..data.dummy_data import get_dummy_cases, get_dummy_dcas
    global cases_db, dcas_db
    cases_db = get_dummy_cases()
    dcas_db = get_dummy_dcas()