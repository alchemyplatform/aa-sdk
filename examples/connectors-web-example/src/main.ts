import { connect, disconnect, reconnect, watchAccount } from '@wagmi/core'
import { sendEmailOtp, submitOtpCode } from '@alchemy/wagmi-core'
import { Buffer } from 'buffer'

import './style.css'
import { config } from './wagmi'

globalThis.Buffer = Buffer

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="account">
      <h2>Account</h2>

      <div>
        status:
        <br />
        addresses:
        <br />
        chainId:
      </div>
    </div>

    <div id="connect">
      <h2>Connect</h2>
      ${config.connectors
        .map(
          (connector) =>
            `<button class="connect" id="${connector.uid}" type="button">${connector.name}</button>`,
        )
        .join('')}
    </div>

    <div id="email-auth">
      <h2>Email Authentication</h2>
      
      <div>
        <input type="email" id="email-input" placeholder="Enter your email" />
        <button id="send-otp" type="button">Send OTP</button>
      </div>
      <div>
        <input type="text" id="otp-input" placeholder="Enter OTP code" maxlength="6" />
        <button id="submit-otp" type="button">Submit OTP</button>
      </div>
      <div id="auth-status"></div>
    </div>
  </div>
`

setupApp(document.querySelector<HTMLDivElement>('#app')!)

function setupApp(element: HTMLDivElement) {
  const connectElement = element.querySelector<HTMLDivElement>('#connect')
  const buttons = element.querySelectorAll<HTMLButtonElement>('.connect')
  for (const button of buttons) {
    const connector = config.connectors.find(
      (connector) => connector.uid === button.id,
    )!
    button.addEventListener('click', async () => {
      try {
        const errorElement = element.querySelector<HTMLDivElement>('#error')
        if (errorElement) errorElement.remove()
        await connect(config, { connector })
      } catch (error) {
        const errorElement = document.createElement('div')
        errorElement.id = 'error'
        errorElement.innerText = (error as Error).message
        connectElement?.appendChild(errorElement)
      }
    })
  }

  watchAccount(config, {
    onChange(account) {
      const accountElement = element.querySelector<HTMLDivElement>('#account')!
      accountElement.innerHTML = `
        <h2>Account</h2>
        <div>
          status: ${account.status}
          <br />
          addresses: ${
            account.addresses ? JSON.stringify(account.addresses) : ''
          }
          <br />
          chainId: ${account.chainId ?? ''}
        </div>
        ${
          account.status === 'connected'
            ? `<button id="disconnect" type="button">Disconnect</button>`
            : ''
        }
      `

      const disconnectButton =
        element.querySelector<HTMLButtonElement>('#disconnect')
      if (disconnectButton)
        disconnectButton.addEventListener('click', () => disconnect(config))
    },
  })

  // Email OTP functionality
  const sendOtpButton = element.querySelector<HTMLButtonElement>('#send-otp')
  const submitOtpButton = element.querySelector<HTMLButtonElement>('#submit-otp')
  const emailInput = element.querySelector<HTMLInputElement>('#email-input')
  const otpInput = element.querySelector<HTMLInputElement>('#otp-input')
  const authStatus = element.querySelector<HTMLDivElement>('#auth-status')

  sendOtpButton?.addEventListener('click', async () => {
    const email = emailInput?.value
    if (!email) {
      if (authStatus) authStatus.innerText = 'Please enter an email address'
      return
    }

    try {
      if (authStatus) authStatus.innerText = 'Sending OTP...'
      await sendEmailOtp(config as any, { email })
      if (authStatus) authStatus.innerText = 'OTP sent! Check your email.'
      if (otpInput) otpInput.focus()
    } catch (error) {
      const errorMessage = (error as Error).message
      if (authStatus) authStatus.innerText = `Error: ${errorMessage}`
    }
  })

  submitOtpButton?.addEventListener('click', async () => {
    const otpCode = otpInput?.value
    if (!otpCode) {
      if (authStatus) authStatus.innerText = 'Please enter the OTP code'
      return
    }

    try {
      if (authStatus) authStatus.innerText = 'Verifying OTP...'
      await submitOtpCode(config as any, { otpCode })
      if (authStatus) authStatus.innerText = 'Authentication successful!'
    } catch (error) {
      if (authStatus) authStatus.innerText = `Error: ${(error as Error).message}`
    }
  })

  reconnect(config)
    .then(() => {})
    .catch(() => {})
}
