export type Branch = {
  HOSP_ID: number;
  HOSP_AR_NAME: string;
  HOSP_EN_NAME: string;
};

export type Specialty = {
  specialty_id: number;
  specialty_name: string;
};

export type Doctor = {
  doctor_id?: string | number;
  hospital_id: number;
  hospital_name?: string;
  doctor_name?: string;
  doctor_en_name?: string;
  doctor_ar_name?: string;
  [k: string]: unknown;
};

export type DoctorBio = {
  doctor_id: string;
  hospital_id: number;
  doctor_bio: string;
  [k: string]: unknown;
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export async function getBranches(): Promise<Branch[]> {
  const data = await apiGet<{ branches: Branch[] }>("/branches");
  return data.branches ?? [];
}

export async function getSpecialties(branchId: number, lang: string): Promise<Specialty[]> {
  // API doc in prompt has "??lang=E" (double '?'); we use standard '?'
  const data = await apiGet<{ specialties: Specialty[] }>(`/specialties/${branchId}?lang=${encodeURIComponent(lang)}`);
  return data.specialties ?? [];
}

export async function getDoctors(
  branchId: number,
  specialtyId: number,
  lang: string,
): Promise<Doctor[]> {
  const data = await apiGet<{ doctors: Doctor[] }>(
    `/doctors/${branchId}/${specialtyId}?lang=${encodeURIComponent(lang)}`,
  );
  return data.doctors ?? [];
}

export async function getDoctorBio(doctorId: string | number, lang: string): Promise<DoctorBio> {
  const data = await apiGet<DoctorBio>(
    `/get_doctor_bio?doctorId=${encodeURIComponent(String(doctorId))}&lang=${encodeURIComponent(lang)}`,
  );
  return data;
}

