/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js'

import { getCss } from './brave_account_otp_input.css.js'
import { getHtml } from './brave_account_otp_input.html.js'

export type OtpInputEventDetail = { code: string; isComplete: boolean }

export class BraveAccountOtpInputElement extends CrLitElement {
  static get is() {
    return 'brave-account-otp-input'
  }

  static override get styles() {
    return getCss()
  }

  override render() {
    return getHtml.bind(this)()
  }

  static override get properties() {
    return {
      digits: { type: Number },
    }
  }

  protected onInput(detail: { value: string }, index: number) {
    const value = detail.value.replace(/\D/g, '')

    if (value) {
      // Move to next input if available
      if (index < this.digits - 1) {
        this.focusInput(index + 1)
      }
    }

    this.emitCode()
  }

  protected onKeyDown(detail: { innerEvent: KeyboardEvent }, index: number) {
    const e = detail.innerEvent
    const inputs = this.getInputs()

    // Allow all modifier key combinations (Cmd+Q, Cmd+C, etc.)
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return
    }

    // Reject anything that's not 0-9, backspace, delete, or tab
    if (!/^[0-9]$/.test(e.key) && !['Backspace', 'Delete', 'Tab'].includes(e.key)) {
      e.preventDefault()
      return
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      const currentInput = inputs[index]
      if (!currentInput) {
        return
      }

      const currentValue = this.getInputValue(currentInput)

      // If current box has content, let the default backspace behavior clear it
      if (currentValue) {
        return
      }

      // If current box is empty and not the first box, move to previous and clear it
      if (index > 0) {
        const previousInput = inputs[index - 1]
        if (previousInput) {
          // Clear the previous input
          this.setInputValue(previousInput, '')
          // Focus the previous input
          this.focusInput(index - 1)
          e.preventDefault()
          this.emitCode()
        }
      }
    }
  }

  protected onPaste(e: ClipboardEvent) {
    e.preventDefault()
    const pastedData = e.clipboardData?.getData('text') || ''
    const digits = pastedData.replace(/\D/g, '')

    const leoInputs = this.getInputs()

    // Find which input is currently focused
    let startIndex = 0
    const activeElement = this.shadowRoot?.activeElement || document.activeElement
    for (let i = 0; i < leoInputs.length; i++) {
      const leoInput = leoInputs[i]
      if (leoInput === activeElement) {
        startIndex = i
        break
      }
    }

    // Paste starting from the focused input
    digits.split('').forEach((char, offset) => {
      const index = startIndex + offset
      if (index >= this.digits) return

      const leoInput = leoInputs[index]
      if (leoInput) {
        this.setInputValue(leoInput, char)
      }
    })

    // Focus the next empty input or the last one
    const nextIndex = Math.min(startIndex + digits.length, this.digits - 1)
    this.focusInput(nextIndex)

    this.emitCode()
  }

  private getInputs(): HTMLElement[] {
    return Array.from(
      this.shadowRoot?.querySelectorAll('leo-input') ?? [],
    )
  }

  private focusInput(index: number) {
    const inputs = this.getInputs()
    const input = inputs[index]
    if (input) {
      input.focus()
    }
  }

  private setInputValue(leoInput: HTMLElement, value: string) {
    // Set the value property directly on leo-input
    (leoInput as any).value = value
  }

  private getInputValue(leoInput: HTMLElement): string {
    return (leoInput as any).value || ''
  }

  private emitCode() {
    const inputs = this.getInputs()
    const code = inputs.map((input) => this.getInputValue(input)).join('')

    this.fire('otp-input', {
      code,
      isComplete: code.length === this.digits,
    } satisfies OtpInputEventDetail)
  }

  protected accessor digits = 8
}

declare global {
  interface HTMLElementTagNameMap {
    'brave-account-otp-input': BraveAccountOtpInputElement
  }
}

customElements.define(
  BraveAccountOtpInputElement.is,
  BraveAccountOtpInputElement,
)
