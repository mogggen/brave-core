/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import { html } from '//resources/lit/v3_0/lit.rollup.js'

import { BraveAccountOtpInputElement } from './brave_account_otp_input.js'

export function getHtml(this: BraveAccountOtpInputElement) {
  const inputs = Array.from({ length: this.digits }, (_, index) => index)

  return html`
    <div class="otp-inputs" @paste=${this.onPaste}>
      ${inputs.map(
        (index) => html`
          <leo-input
            autofocus=${index === 0}
            inputmode="numeric"
            maxlength="1"
            pattern="[0-9]"
            type="text"
            @input=${(detail: { value: string }) => this.onInput(detail, index)}
            @keydown=${(detail: { innerEvent: KeyboardEvent }) => this.onKeyDown(detail, index)}
          >
          </leo-input>
        `,
      )}
    </div>`
}
