# 自愿加班协议系统

自愿加班协议系统是一款安全、便捷的电子协议签署平台，旨在帮助企业和员工高效管理加班协议的创建、签署和查看流程。该系统基于 **FastAPI** 后端和现代化前端技术实现，并支持电子签名和数据加密，确保协议的合法性与安全性。


## 功能特点
- **协议创建**：支持员工填写个人信息、加班信息并签署电子协议。
- **协议查看**：通过协议ID和解密密钥查看已签署的协议内容。
- **数据加密**：使用AES加密技术保护协议数据，确保协议内容的隐私性。
- **PDF生成**：支持将协议内容导出为PDF文件。
- **响应式设计**：优化的用户界面，适配不同设备。

## 技术栈
- **后端**：FastAPI
- **前端**：HTML、CSS、JavaScript
- **加密**：CryptoJS
- **PDF生成**：jsPDF + html2canvas
- **签名板**：SignaturePad

## 项目结构
```
├── index.html          # 前端页面
├── styles.css          # 样式文件
├── script.js           # 前端逻辑脚本
├── main.py             # FastAPI后端代码
├── requirements.txt    # Python依赖列表
├── config.yaml         # 配置文件
```

## 安装与运行

### 前置条件
- Python 3.8+
- Node.js（可选，用于前端构建）
- pip（Python包管理工具）

### 安装步骤
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/RusianHu/WorkExtraConsent.git
   cd WorkExtraConsent
   ```

2. 安装后端依赖：
   ```bash
   pip install -r requirements.txt
   ```

3. 启动后端服务：
   ```bash
   uvicorn main:app --reload
   ```

4. 配置前端：
   - 将 `index.html` 和相关静态文件部署到任意静态服务器（如Nginx）。
   - 或直接在本地打开 `index.html` 文件进行测试。

### 配置文件
项目中的 `config.yaml` 文件包含公司信息和协议条款，可根据实际需求进行修改：
```yaml
company:
  name: "厚礼蟹有限公司"
  address: "北京市海淀区科技园路88号"
  phone: "010-88889999"
  email: "yanshanlaosiji@gmail.com"

agreement:
  title: "自愿加班协议"
  terms:
    - "本人完全自愿参加公司安排的加班工作，不存在任何强制因素"
    - "本人已充分了解《中华人民共和国劳动法》关于工作时间和加班的相关规定"
    - "本人确认此次加班系出于个人意愿，非公司强制要求"
    - "本人同意按照公司规定获取相应的加班补偿"
    - "本协议自签署之日起生效"
```

## 使用方法

### 创建协议
- 打开系统页面，填写个人信息、加班信息并签署电子协议。
- 点击“生成协议”按钮后，系统会返回协议ID和解密密钥，请妥善保存。

### 查看协议
- 输入协议ID和解密密钥，系统会解密并展示协议内容。

### 导出PDF
- 在协议详情页面点击“下载PDF”按钮，系统会生成协议的PDF文件。

## 样式
![image](https://github.com/user-attachments/assets/ea7c3a41-72d7-4d92-860a-95fb5a071d29)

![image](https://github.com/user-attachments/assets/91682814-842f-43f4-a8e2-43ddc27d4f0d)

## 许可证
本项目基于 [MIT License](LICENSE) 开源。您可以自由使用、修改和分发本项目，但需保留版权声明。

## 联系我们
- **邮箱**: yanshanlaosiji@gmail.com
- **GitHub**: [WorkExtraConsent](https://github.com/RusianHu/WorkExtraConsent)
