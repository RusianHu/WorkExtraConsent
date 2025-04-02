from fastapi import FastAPI, HTTPException, Request, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
import json
import os
from datetime import datetime
import yaml

app = FastAPI(title="WorkExtraConsent API", 
              description="自愿加班协议系统 API",
              version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 加载配置文件
def load_config():
    if os.path.exists("config.yaml"):
        with open("config.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {
        "company": {
            "name": "示例公司",
            "address": "北京市朝阳区示例路123号",
            "phone": "010-12345678",
            "email": "contact@example.com"
        },
        "agreement": {
            "title": "自愿加班协议",
            "terms": [
                "本人自愿参加公司安排的加班工作",
                "本人已知晓相关劳动法规定",
                "本人确认加班系出于自愿，非公司强制要求"
            ]
        }
    }

# 协议请求模型
class AgreementRequest(BaseModel):
    name: str
    id_number: str
    department: str
    position: str
    start_date: str
    end_date: str
    reason: str
    signature_data: str

# 协议存储模型
class Agreement(BaseModel):
    id: str
    created_at: str
    encrypted_data: str
    # 注意：不存储解密密钥

# 内存存储 (实际应用中应使用数据库)
agreements = {}

@app.get("/")
async def root():
    return {"message": "WorkExtraConsent API 运行正常"}

@app.get("/config")
async def get_config():
    config = load_config()
    return config

@app.post("/agreements")
async def create_agreement(agreement: AgreementRequest):
    # 生成唯一ID
    agreement_id = str(uuid.uuid4())
    
    # 记录创建时间
    created_at = datetime.now().isoformat()
    
    # 这里只存储加密后的数据，实际加密在前端完成
    # 后端只接收已加密的数据
    new_agreement = Agreement(
        id=agreement_id,
        created_at=created_at,
        encrypted_data=agreement.signature_data  # 这里应该是前端加密后的数据
    )
    
    # 存储协议
    agreements[agreement_id] = new_agreement.dict()
    
    return {"agreement_id": agreement_id, "created_at": created_at}

@app.get("/agreements/{agreement_id}")
async def get_agreement(agreement_id: str):
    if agreement_id not in agreements:
        raise HTTPException(status_code=404, detail="协议不存在")
    
    return agreements[agreement_id]

# 启动服务
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)