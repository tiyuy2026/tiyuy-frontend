export class IdentityRepository {

  // ✔️ Validar DNI
  async validateDni(dni: string) {
    const res = await fetch(`/identity/validate-dni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni })
    });
    return res.json();
  }

  // ✔️ Completar KYC
  async completeKyc(userId: number, documents: FormData) {
    const res = await fetch(`/identity/complete-kyc/${userId}`, {
      method: 'POST',
      body: documents
    });
    return res.json();
  }

  // ✔️ Subir a Developer
  async upgradeToDeveloper(userId: number, ruc: string) {
    const res = await fetch(`/identity/upgrade-to-developer/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruc })
    });
    return res.json();
  }


  // 🚨 MÉTODOS QUE LA INTERFAZ EXIGE
  // =========================================================

  // ✔️ Validar RUC
  async validateRuc(ruc: string) {
    const res = await fetch(`/identity/validate-ruc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruc })
    });
    return res.json();
  }

  // ✔️ Subir a AGENTE
  async upgradeToAgent(userId: number, ruc: string) {
    const res = await fetch(`/identity/upgrade-to-agent/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruc })
    });
    return res.json();
  }

  // ✔️ Obtener estado del KYC
  async getKycStatus(userId: number) {
    const res = await fetch(`/identity/kyc-status/${userId}`);
    return res.json();
  }
}
