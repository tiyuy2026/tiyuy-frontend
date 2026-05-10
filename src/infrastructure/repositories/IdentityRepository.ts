// src/infrastructure/repositories/IdentityRepository.ts

export class IdentityRepository {

  // ✔️ Validar DNI
  async validateDni(dni: string) {
    const response = await fetch(`/identity/validate-dni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni })
    });

    if (!response.ok) throw new Error('Error validating DNI');
    return await response.json();
  }

  // ✔️ Completar KYC
  async completeKyc(userId: number, documents: FormData) {
    const response = await fetch(`/identity/complete-kyc/${userId}`, {
      method: 'POST',
      body: documents   // FormData automáticamente maneja headers
    });

    if (!response.ok) throw new Error('Error completing KYC');
    return await response.json();
  }

  // ✔️ Subir a Developer / Inmobiliaria
  async upgradeToDeveloper(userId: number, ruc: string) {
    const response = await fetch(`/identity/upgrade-to-developer/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruc })
    });

    if (!response.ok) throw new Error('Error upgrading user');
    return await response.json();
  }
}
