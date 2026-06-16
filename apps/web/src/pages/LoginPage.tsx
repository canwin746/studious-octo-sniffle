import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 验证用户协议
    if (!agreeTerms) {
      setError('请同意用户协议')
      setLoading(false)
      return
    }

    try {
      let response
      
      if (isLogin) {
        response = await authApi.login(username, password)
      } else {
        response = await authApi.register(username, password, email || undefined, phone || undefined, 'STUDENT')
      }
      
      if (response.success) {
        login(
          response.data.token,
          {
            id: response.data.user.id,
            username: response.data.user.username,
            role: response.data.user.role as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          response.data.user.teacherProfile
        )
        navigate('/dashboard')
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('操作失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* 登录卡片 */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">教师数字画像系统</h1>
          <p className="text-white/70">{isLogin ? '欢迎回来' : '创建新账户'}</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              placeholder="用户名"
              required
            />
          </div>

          {/* 邮箱（注册） */}
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="邮箱（可选）"
              />
            </div>
          )}

          {/* 手机号（注册） */}
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="手机号（可选）"
              />
            </div>
          )}

          {/* 密码 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              placeholder="密码"
              required
            />
          </div>

          {/* 用户协议 */}
          <div className="flex items-start space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            <p className="text-white/70 text-sm mt-1">
              我已阅读并同意
              <span 
                className="text-blue-400 hover:underline cursor-pointer"
                onClick={() => setShowTermsModal(true)}
              >《用户协议》</span>
              和
              <span 
                className="text-blue-400 hover:underline cursor-pointer"
                onClick={() => setShowPrivacyModal(true)}
              >《隐私政策》</span>
            </p>
          </div>

          {/* 登录/注册按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登 录' : '注 册')}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-white/70 hover:text-white focus:outline-none transition-colors font-medium"
          >
            {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>


      </div>

      {/* 用户协议模态框 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">用户协议</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-700 text-sm space-y-4">
              <p className="text-center font-bold text-base mb-4">教师数字画像系统用户协议</p>
              <p className="text-center text-gray-500 text-xs mb-6">版本号：V1.0 | 更新日期：2024年1月1日</p>
              
              <p><strong>一、服务条款</strong></p>
              <p>1. 您必须年满18周岁，具备完全民事行为能力，才能使用本服务。</p>
              <p>2. 您承诺在注册时提供的所有信息均真实、准确、完整，并且会及时更新这些信息。</p>
              <p>3. 您负责维护账号和密码的安全，定期更换密码，并对所有使用您账号的活动负全部责任。</p>
              <p>4. 您同意接收来自系统的通知信息，包括但不限于服务更新、安全提醒、重要公告等。</p>
              <p>5. 您理解并同意，本系统可能会因维护、升级等原因暂停服务，我们会尽可能提前通知。</p>
              
              <p><strong>二、用户行为规范</strong></p>
              <p>1. 不得使用本系统从事任何违法、违规或违反公序良俗的活动，包括但不限于传播非法信息、网络攻击、数据窃取等。</p>
              <p>2. 不得侵犯他人的知识产权、隐私权、名誉权等合法权益，不得发布或传播侵犯他人权利的内容。</p>
              <p>3. 不得干扰系统的正常运行，不得尝试破解系统安全、绕过访问控制或进行任何形式的恶意攻击。</p>
              <p>4. 不得滥用系统资源，包括但不限于恶意注册、批量操作、发送垃圾信息等行为。</p>
              <p>5. 教师用户承诺所提交的科研成果、课程信息等均真实有效，符合学术规范和学校要求。</p>
              
              <p><strong>三、服务变更与终止</strong></p>
              <p>1. 我们有权随时修改、暂停或终止服务，无需提前通知，并保留解释权。</p>
              <p>2. 用户可随时申请注销账号，注销后相关数据将按照隐私政策进行处理。</p>
              <p>3. 若用户违反本协议，我们有权暂停或终止其账号使用权，并保留追究法律责任的权利。</p>
              <p>4. 服务终止后，用户将无法访问系统，但我们仍会按照法律法规要求保留相关数据。</p>
              
              <p><strong>四、知识产权</strong></p>
              <p>1. 本系统的所有内容，包括但不限于软件、代码、界面、文字、图片等，均受知识产权法保护。</p>
              <p>2. 用户在系统中提交的原创内容，知识产权归用户所有，但授予系统非排他性使用权。</p>
              <p>3. 未经授权，任何人不得复制、传播、修改或使用本系统的任何部分。</p>
              
              <p><strong>五、免责声明</strong></p>
              <p>1. 本系统仅供内部教学管理使用，数据仅供参考，不构成任何正式文件或证明。</p>
              <p>2. 我们不对因使用本系统造成的直接或间接损失承担责任，包括但不限于数据丢失、业务中断等。</p>
              <p>3. 本系统提供的信息可能存在延迟或误差，我们不保证信息的绝对准确性和完整性。</p>
              <p>4. 对于因不可抗力或第三方原因导致的服务中断或数据损失，我们不承担责任。</p>
              
              <p><strong>六、争议解决</strong></p>
              <p>1. 本协议的解释和执行均适用中华人民共和国法律。</p>
              <p>2. 若因本协议产生争议，双方应首先通过友好协商解决。</p>
              <p>3. 协商不成的，任何一方均可向系统所在地有管辖权的法院提起诉讼。</p>
              
              <p><strong>七、其他</strong></p>
              <p>1. 本协议构成用户与系统管理方之间的完整协议，取代之前的所有口头或书面协议。</p>
              <p>2. 我们有权随时更新本协议，更新后将通过系统公告通知用户，用户继续使用服务即表示接受更新。</p>
              <p>3. 本协议最终解释权归教师数字画像系统管理方所有。</p>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                我已阅读
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐私政策模态框 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">隐私政策</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-700 text-sm space-y-4">
              <p className="text-center font-bold text-base mb-4">教师数字画像系统隐私政策</p>
              <p className="text-center text-gray-500 text-xs mb-6">版本号：V1.0 | 更新日期：2024年1月1日</p>
              
              <p><strong>一、收集的信息</strong></p>
              <p>1. 个人身份信息：包括姓名、账号、密码（加密存储）、邮箱地址、手机号码等用于身份验证和联系的信息。</p>
              <p>2. 使用数据：包括登录记录、操作日志、访问时间、IP地址、设备信息等，用于分析使用模式和保障安全。</p>
              <p>3. 教师相关数据：包括职称、所属学院、教授课程、科研成果、评价数据等，用于展示教师数字画像。</p>
              <p>4. 学生评价数据：包括对教师的评价内容、评分等，用于教学质量评估和反馈。</p>
              <p>5. 系统自动收集的数据：包括浏览器类型、操作系统、页面访问记录等技术信息。</p>
              
              <p><strong>二、信息使用</strong></p>
              <p>1. 提供和维护服务：使用您的信息来提供、维护和改进系统功能，确保服务正常运行。</p>
              <p>2. 身份验证和安全：使用身份信息进行登录验证，保护账号安全，防止未授权访问。</p>
              <p>3. 个性化服务：根据您的角色和使用习惯，提供个性化的界面和功能推荐。</p>
              <p>4. 数据分析和优化：分析使用数据来改进系统性能、用户体验和服务质量。</p>
              <p>5. 合规要求：遵守法律法规要求，完成必要的报告和审计。</p>
              <p>6. 安全保障：检测和防止欺诈、滥用和安全威胁，保护系统和用户数据安全。</p>
              
              <p><strong>三、信息保护</strong></p>
              <p>1. 数据加密：采用SSL/TLS加密技术保护数据传输，敏感数据存储时进行加密处理。</p>
              <p>2. 访问控制：实施严格的访问权限管理，仅授权人员可访问敏感数据。</p>
              <p>3. 安全审计：定期进行安全审计和漏洞检测，及时修复安全隐患。</p>
              <p>4. 数据备份：定期备份数据，防止数据丢失，确保业务连续性。</p>
              <p>5. 员工培训：对系统管理员和相关人员进行隐私保护和安全培训。</p>
              
              <p><strong>四、信息共享</strong></p>
              <p>1. 不会出售信息：我们绝不会向任何第三方出售您的个人信息。</p>
              <p>2. 必要的披露：仅在以下情况下可能披露信息：</p>
              <p>   (1) 法律要求：根据法律法规、法院命令或政府要求披露；</p>
              <p>   (2) 安全需要：为了保护系统安全、用户安全或公共安全；</p>
              <p>   (3) 用户同意：在用户明确同意的情况下共享特定信息。</p>
              <p>3. 第三方服务：可能使用第三方服务提供商（如云服务、支付服务等），要求他们遵守隐私保护要求。</p>
              
              <p><strong>五、您的权利</strong></p>
              <p>1. 访问权：您有权访问您的个人信息，了解我们收集和使用的具体内容。</p>
              <p>2. 更正权：如果您的信息不准确或不完整，您有权要求更正。</p>
              <p>3. 删除权：您有权要求删除您的个人信息，符合法律法规要求的除外。</p>
              <p>4. 注销权：您有权随时注销账号，相关数据将按照本政策处理。</p>
              <p>5. 选择权：您可以选择是否接收非必要的通知信息。</p>
              
              <p><strong>六、数据保留</strong></p>
              <p>1. 账号存续期间：在您的账号存在期间，我们会保留您的信息以提供服务。</p>
              <p>2. 账号注销后：账号注销后，我们会在合理期限内删除或匿名化您的个人信息。</p>
              <p>3. 法律要求：根据法律法规要求，可能需要保留特定数据一定期限。</p>
              
              <p><strong>七、政策变更</strong></p>
              <p>1. 我们可能不定期更新本政策，更新后将通过系统公告通知您。</p>
              <p>2. 重大变更会通过弹窗或邮件方式通知您，您继续使用服务即表示接受更新。</p>
              <p>3. 您可以随时查看最新版本的隐私政策。</p>
              
              <p><strong>八、联系我们</strong></p>
              <p>如果您对本隐私政策有任何疑问或建议，或者需要行使您的权利，请联系系统管理员。</p>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                我已阅读
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
