from pydantic import BaseModel

class IngestResponse(BaseModel):
    indexed_count: int
    indexed_name: str
    source_file: str
    