document.addEventListener('DOMContentLoaded', function() {
    // API基础URL
    const API_BASE_URL = 'http://localhost:8000';
    
    // 初始化签名板
    const canvas = document.getElementById('signature-pad');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)'
    });
    
    // 调整签名板大小
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear(); // 清除签名
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // 清除签名按钮
    document.getElementById('clear-signature').addEventListener('click', function() {
        signaturePad.clear();
    });
    
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 移除所有活动标签
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 激活当前标签
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 加载配置和条款
    async function loadConfig() {
        try {
            const response = await fetch(`${API_BASE_URL}/config`);
            const config = await response.json();
            
            // 加载条款
            const termsContainer = document.getElementById('terms-container');
            termsContainer.innerHTML = '';
            
            // 添加公司信息
            const companyInfo = document.createElement('div');
            companyInfo.classList.add('company-info');
            companyInfo.innerHTML = `
                <h3>${config.company.name} - ${config.agreement.title}</h3>
                <p>公司地址：${config.company.address}</p>
                <p>联系电话：${config.company.phone}</p>
                <p>电子邮箱：${config.company.email}</p>
                <hr>
            `;
            termsContainer.appendChild(companyInfo);
            
            // 添加条款
            config.agreement.terms.forEach((term, index) => {
                const termItem = document.createElement('div');
                termItem.classList.add('term-item');
                termItem.innerHTML = `
                    <span class="term-number">${index + 1}.</span>
                    <span class="term-text">${term}</span>
                `;
                termsContainer.appendChild(termItem);
            });
            
            return config;
        } catch (error) {
            console.error('加载配置失败:', error);
            const termsContainer = document.getElementById('terms-container');
            termsContainer.innerHTML = '<p class="error">加载条款失败，请刷新页面重试。</p>';
            return null;
        }
    }
    
    // 页面加载时获取配置
    let configData = null;
    loadConfig().then(config => {
        configData = config;
    });
    
    // 生成随机密钥
    function generateKey(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        for (let i = 0; i < length; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }
    
    // 加密数据
    function encryptData(data, key) {
        return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    }
    
    // 解密数据
    function decryptData(encryptedData, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            console.error('解密失败:', error);
            return null;
        }
    }
    
    // 模态框控制
    const modal = document.getElementById('result-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    
    // 创建协议表单提交
    document.getElementById('agreement-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (signaturePad.isEmpty()) {
            alert('请先签名再提交');
            return;
        }
        
        if (!document.getElementById('accept_terms').checked) {
            alert('请阅读并同意协议条款');
            return;
        }
        
        try {
            // 收集表单数据
            const formData = {
                name: document.getElementById('name').value,
                id_number: document.getElementById('id_number').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                start_date: document.getElementById('start_date').value,
                end_date: document.getElementById('end_date').value,
                reason: document.getElementById('reason').value,
                signature: signaturePad.toDataURL()
            };
            
            // 生成密钥
            const encryptionKey = generateKey();
            
            // 加密数据
            const encryptedData = encryptData(formData, encryptionKey);
            
            // 发送到服务器
            const response = await fetch(`${API_BASE_URL}/agreements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    id_number: formData.id_number,
                    department: formData.department,
                    position: formData.position,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    reason: formData.reason,
                    signature_data: encryptedData
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // 显示结果
                document.getElementById('modal-content').innerHTML = `
                    <div class="result-info">
                        <div class="key-value">
                            <span class="key">协议ID：</span>
                            <span class="value">${result.agreement_id}</span>
                        </div>
                        <div class="key-value">
                            <span class="key">创建时间：</span>
                            <span class="value">${new Date(result.created_at).toLocaleString()}</span>
                        </div>
                        <div class="key-value">
                            <span class="key">解密密钥：</span>
                            <span class="value"><code>${encryptionKey}</code></span>
                        </div>
                    </div>
                    <div class="important-note">
                        <strong>重要提示：</strong>
                        <p>请妥善保存您的协议ID和解密密钥，这是查看协议的唯一凭证。</p>
                        <p>解密密钥仅显示一次，系统不会保存，遗失后将无法恢复协议内容。</p>
                    </div>
                `;
                
                // 存储临时数据用于PDF生成
                window.tempAgreementData = {
                    formData,
                    agreementId: result.agreement_id,
                    createdAt: result.created_at,
                    config: configData
                };
                
                modal.style.display = "block";
            } else {
                alert('创建协议失败: ' + result.detail);
            }
        } catch (error) {
            console.error('提交表单错误:', error);
            alert('提交表单时发生错误，请重试');
        }
    });
    
    // 查看协议表单提交
    document.getElementById('view-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const agreementId = document.getElementById('agreement_id').value;
        const decryptKey = document.getElementById('decrypt_key').value;
        
        try {
            // 获取加密的协议数据
            const response = await fetch(`${API_BASE_URL}/agreements/${agreementId}`);
            
            if (!response.ok) {
                alert('未找到协议，请检查协议ID');
                return;
            }
            
            const agreement = await response.json();
            
            // 解密数据
            const decryptedData = decryptData(agreement.encrypted_data, decryptKey);
            
            if (!decryptedData) {
                alert('解密失败，请检查密钥是否正确');
                return;
            }
            
            // 获取配置信息（如果尚未加载）
            if (!configData) {
                configData = await loadConfig();
            }
            
            // 存储临时数据用于PDF生成
            window.tempAgreementData = {
                formData: decryptedData,
                agreementId: agreementId,
                createdAt: agreement.created_at,
                config: configData
            };
            
            // 显示结果
            document.getElementById('modal-content').innerHTML = `
                <div class="result-info">
                    <div class="key-value">
                        <span class="key">姓名：</span>
                        <span class="value">${decryptedData.name}</span>
                    </div>
                    <div class="key-value">
                        <span class="key">部门：</span>
                        <span class="value">${decryptedData.department}</span>
                    </div>
                    <div class="key-value">
                        <span class="key">职位：</span>
                        <span class="value">${decryptedData.position}</span>
                    </div>
                    <div class="key-value">
                        <span class="key">加班时间：</span>
                        <span class="value">${new Date(decryptedData.start_date).toLocaleString()} 至 ${new Date(decryptedData.end_date).toLocaleString()}</span>
                    </div>
                    <div class="key-value">
                        <span class="key">加班原因：</span>
                        <span class="value">${decryptedData.reason}</span>
                    </div>
                </div>
                <div class="signature-preview">
                    <h3>电子签名</h3>
                    <img src="${decryptedData.signature}" alt="电子签名" style="max-width: 100%; border: 1px solid #ddd;">
                </div>
            `;
            
            modal.style.display = "block";
        } catch (error) {
            console.error('查看协议错误:', error);
            alert('查看协议时发生错误，请重试');
        }
    });
    
    // 下载PDF
    document.getElementById('download-pdf').addEventListener('click', function() {
        if (!window.tempAgreementData) {
            alert('无法生成PDF，数据不完整');
            return;
        }
        
        generatePDF(window.tempAgreementData);
    });
    
    // 生成PDF
    async function generatePDF(data) {
        try {
            // 创建临时DOM元素用于渲染PDF内容
            const pdfContent = document.createElement('div');
            pdfContent.style.width = '800px';
            pdfContent.style.padding = '40px';
            pdfContent.style.position = 'absolute';
            pdfContent.style.left = '-9999px';
            document.body.appendChild(pdfContent);
            
            // 添加水印样式
            const watermarkStyle = document.createElement('style');
            watermarkStyle.textContent = `
                .watermark {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0.1;
                    transform: rotate(-45deg);
                    font-size: 80px;
                    z-index: -1;
                    color: #888;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(watermarkStyle);
            
            // 填充PDF内容
            pdfContent.innerHTML = `
                <div style="position: relative; min-height: 1000px;">
                    <div class="watermark">${data.config.company.name}</div>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 24px;">${data.config.agreement.title}</h1>
                        <p style="color: #666;">协议ID: ${data.agreementId}</p>
                        <p style="color: #666;">生成时间: ${new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 18px; margin-bottom: 15px;">甲方信息</h2>
                        <p><strong>公司名称：</strong>${data.config.company.name}</p>
                        <p><strong>公司地址：</strong>${data.config.company.address}</p>
                        <p><strong>联系电话：</strong>${data.config.company.phone}</p>
                        <p><strong>电子邮箱：</strong>${data.config.company.email}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 18px; margin-bottom: 15px;">乙方信息</h2>
                        <p><strong>姓名：</strong>${data.formData.name}</p>
                        <p><strong>身份证号：</strong>${data.formData.id_number}</p>
                        <p><strong>部门：</strong>${data.formData.department}</p>
                        <p><strong>职位：</strong>${data.formData.position}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 18px; margin-bottom: 15px;">加班信息</h2>
                        <p><strong>开始时间：</strong>${new Date(data.formData.start_date).toLocaleString()}</p>
                        <p><strong>结束时间：</strong>${new Date(data.formData.end_date).toLocaleString()}</p>
                        <p><strong>加班原因：</strong>${data.formData.reason}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 18px; margin-bottom: 15px;">协议条款</h2>
                        <ol>
                            ${data.config.agreement.terms.map(term => `<li style="margin-bottom: 10px;">${term}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 18px; margin-bottom: 15px;">电子签名</h2>
                        <p style="margin-bottom: 10px;">根据《中华人民共和国电子签名法》，该电子签名与手写签名具有同等法律效力。</p>
                        <div style="border: 1px solid #ddd; padding: 10px; display: inline-block;">
                            <img src="${data.formData.signature}" style="max-width: 300px; max-height: 200px;">
                        </div>
                    </div>
                    
                    <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                        <div>
                            <p><strong>甲方（盖章）：</strong></p>
                            <p style="margin-top: 50px;"><strong>日期：</strong>${new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p><strong>乙方（签字）：</strong>${data.formData.name}</p>
                            <p style="margin-top: 50px;"><strong>日期：</strong>${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 100px; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
                        <p>本协议通过自愿加班协议系统生成</p>
                        <p>协议ID: ${data.agreementId} | 生成时间: ${new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            `;
            
            // 使用html2canvas将内容转换为图像
            const canvas = await html2canvas(pdfContent, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // 创建PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // 计算PDF页面尺寸
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            const imgX = (pageWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            
            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // 下载PDF
            pdf.save(`自愿加班协议_${data.formData.name}_${data.agreementId.substring(0, 8)}.pdf`);
            
            // 清理临时元素
            document.body.removeChild(pdfContent);
            document.head.removeChild(watermarkStyle);
            
        } catch (error) {
            console.error('生成PDF错误:', error);
            alert('生成PDF时发生错误，请重试');
        }
    }
});
