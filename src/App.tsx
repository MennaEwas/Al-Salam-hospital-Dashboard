import React, { useEffect, useMemo, useState } from "react";
import type { Branch, Doctor, Specialty } from "./api";
import { getBranches, getDoctorBio, getDoctors, getSpecialties } from "./api";

type LoadState = "idle" | "loading" | "error" | "success";

function getDoctorDisplayName(d: Doctor): string {
  const name =
    (typeof d.doctor_en_name === "string" && d.doctor_en_name) ||
    (typeof d.doctor_name === "string" && d.doctor_name) ||
    (typeof d.doctor_ar_name === "string" && d.doctor_ar_name) ||
    "";
  return name || `Doctor ${String(d.doctor_id ?? "")}`.trim();
}

export default function App() {
  const [lang, setLang] = useState<"E" | "en">("E");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesState, setBranchesState] = useState<LoadState>("idle");
  const [branchesError, setBranchesError] = useState<string>("");

  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesState, setSpecialtiesState] = useState<LoadState>("idle");
  const [specialtiesError, setSpecialtiesError] = useState<string>("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | "">("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsState, setDoctorsState] = useState<LoadState>("idle");
  const [doctorsError, setDoctorsError] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | number | "">("");

  const [doctorBio, setDoctorBio] = useState<string>("");
  const [bioState, setBioState] = useState<LoadState>("idle");
  const [bioError, setBioError] = useState<string>("");

  const selectedBranch = useMemo(
    () => branches.find((b) => b.HOSP_ID === selectedBranchId),
    [branches, selectedBranchId],
  );

  useEffect(() => {
    let cancelled = false;
    setBranchesState("loading");
    setBranchesError("");
    getBranches()
      .then((b) => {
        if (cancelled) return;
        setBranches(b);
        setBranchesState("success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBranchesState("error");
        setBranchesError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // When branch changes, reset downstream selections/data.
  useEffect(() => {
    setSpecialties([]);
    setSelectedSpecialtyId("");
    setSpecialtiesError("");
    setSpecialtiesState(selectedBranchId === "" ? "idle" : "loading");

    setDoctors([]);
    setSelectedDoctorId("");
    setDoctorsError("");
    setDoctorsState("idle");

    setDoctorBio("");
    setBioError("");
    setBioState("idle");

    if (selectedBranchId === "") return;

    let cancelled = false;
    getSpecialties(selectedBranchId, lang)
      .then((s) => {
        if (cancelled) return;
        setSpecialties(s);
        setSpecialtiesState("success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSpecialtiesState("error");
        setSpecialtiesError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, lang]);

  // When specialty changes, reset doctors/bio and load doctors.
  useEffect(() => {
    setDoctors([]);
    setSelectedDoctorId("");
    setDoctorsError("");
    setDoctorsState(selectedBranchId === "" || selectedSpecialtyId === "" ? "idle" : "loading");

    setDoctorBio("");
    setBioError("");
    setBioState("idle");

    if (selectedBranchId === "" || selectedSpecialtyId === "") return;

    let cancelled = false;
    getDoctors(selectedBranchId, selectedSpecialtyId, lang)
      .then((d) => {
        if (cancelled) return;
        setDoctors(d);
        setDoctorsState("success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setDoctorsState("error");
        setDoctorsError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, selectedSpecialtyId, lang]);

  // When doctor changes, load bio.
  useEffect(() => {
    setDoctorBio("");
    setBioError("");
    setBioState(selectedDoctorId === "" ? "idle" : "loading");

    if (selectedDoctorId === "") return;

    let cancelled = false;
    const bioLang = lang === "E" ? "en" : lang;
    getDoctorBio(selectedDoctorId, bioLang)
      .then((bio) => {
        if (cancelled) return;
        setDoctorBio(bio.doctor_bio ?? "");
        setBioState("success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBioState("error");
        setBioError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDoctorId, lang]);

  return (
    <div className="page">
      <div className="card">
        <header className="header">
          <div>
            <div className="title">Al Salam Dashboard</div>
            <div className="subtitle">Branches → Specialties → Doctors → Bio</div>
          </div>

          <div className="row">
            <label className="label">
              Language
              <select
                className="select"
                value={lang}
                onChange={(e) => setLang(e.target.value as "E" | "en")}
              >
                <option value="E">E</option>
                <option value="en">en</option>
              </select>
            </label>
          </div>
        </header>

        <div className="grid">
          <label className="label">
            Branch
            <select
              className="select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : "")}
              disabled={branchesState === "loading" || branchesState === "error"}
            >
              <option value="">{branchesState === "loading" ? "Loading..." : "Select a branch"}</option>
              {branches.map((b) => (
                <option key={b.HOSP_ID} value={b.HOSP_ID}>
                  {b.HOSP_EN_NAME}
                </option>
              ))}
            </select>
            {branchesState === "error" && <div className="error">Failed: {branchesError}</div>}
          </label>

          <label className="label">
            Specialty
            <select
              className="select"
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value ? Number(e.target.value) : "")}
              disabled={selectedBranchId === "" || specialtiesState === "loading" || specialtiesState === "error"}
            >
              <option value="">
                {selectedBranchId === ""
                  ? "Select a branch first"
                  : specialtiesState === "loading"
                    ? "Loading..."
                    : "Select a specialty"}
              </option>
              {specialties.map((s) => (
                <option key={s.specialty_id} value={s.specialty_id}>
                  {s.specialty_name}
                </option>
              ))}
            </select>
            {specialtiesState === "error" && <div className="error">Failed: {specialtiesError}</div>}
          </label>

          <label className="label">
            Doctor
            <select
              className="select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value || "")}
              disabled={
                selectedBranchId === "" ||
                selectedSpecialtyId === "" ||
                doctorsState === "loading" ||
                doctorsState === "error"
              }
            >
              <option value="">
                {selectedBranchId === "" || selectedSpecialtyId === ""
                  ? "Select branch & specialty first"
                  : doctorsState === "loading"
                    ? "Loading..."
                    : "Select a doctor"}
              </option>
              {doctors.map((d, idx) => {
                const id = d.doctor_id ?? `${idx}`;
                return (
                  <option key={String(id)} value={String(id)}>
                    {getDoctorDisplayName(d)}
                  </option>
                );
              })}
            </select>
            {doctorsState === "error" && <div className="error">Failed: {doctorsError}</div>}
          </label>
        </div>

        <div className="bio">
          <div className="bioHeader">
            <div className="bioTitle">Doctor Bio</div>
            <div className="bioMeta">
              {selectedBranch ? `Branch: ${selectedBranch.HOSP_EN_NAME}` : "No branch selected"}
            </div>
          </div>

          {bioState === "idle" && <div className="muted">Pick a doctor to load the bio.</div>}
          {bioState === "loading" && <div className="muted">Loading bio…</div>}
          {bioState === "error" && <div className="error">Failed: {bioError}</div>}
          {bioState === "success" && (
            <pre className="bioText">{doctorBio?.trim() ? doctorBio : "No bio returned."}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

