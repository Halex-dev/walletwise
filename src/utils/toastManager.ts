import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

type ToastSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'error'
  | 'secondary'
  | 'contrast'

export class ToastManager {
  private static instance: ToastManager
  private toast
  private i18n

  private constructor() {
    this.toast = useToast()
    this.i18n = useI18n()
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  private showToast(
    severity: ToastSeverity,
    summary: string,
    detail: string,
    life: number = 3000
  ) {
    this.toast.add({
      severity,
      summary,
      detail,
      life,
    })
  }

  private translate(key: string, params?: Record<string, any>): string {
    return params ? this.i18n.t(key, params) : this.i18n.t(key)
  }

  public showSuccess(key: string, params?: Record<string, any>) {
    const message = this.translate(key, params)
    this.showToast('success', this.translate('common.success'), message)
  }

  public showError(key: string, params?: Record<string, any>) {
    const message = this.translate(key, params)
    this.showToast('error', this.translate('common.error'), message)
  }

  public showInfo(key: string, params?: Record<string, any>) {
    const message = this.translate(key, params)
    this.showToast('info', this.translate('common.info'), message)
  }

  public showWarning(key: string, params?: Record<string, any>) {
    const message = this.translate(key, params)
    this.showToast('warn', this.translate('common.warning'), message)
  }
}

export const useToastManager = () => ToastManager.getInstance()
