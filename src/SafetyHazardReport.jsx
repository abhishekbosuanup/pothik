import React, { useState } from "react";

const LANG = {
  en: {
    button: "Report Safety Hazard",
    title: "Report a Safety Concern",
    subtitle:
      "Help other travellers by reporting a safety issue.",
    type: "Hazard Type",
    selectType: "Select a hazard",
    lighting: "Poor street lighting",
    harassment: "Harassment or suspicious activity",
    accident: "Accident or road incident",
    waterlogging: "Waterlogging or flooding",
    roadDamage: "Damaged or unsafe road",
    traffic: "Traffic or road obstruction",
    other: "Other safety concern",
    severity: "Risk Level",
    low: "Low",
    medium: "Medium",
    high: "High",
    location: "Location / Area",
    locationPlaceholder: "Enter place name or address",
    gps: "Use Current GPS Location",
    gettingGps: "Getting location...",
    description: "Describe the problem",
    descriptionPlaceholder:
      "What happened? What should other travellers know?",
    anonymous: "Submit without sharing my name",
    submit: "Submit Report",
    submitting: "Submitting...",
    cancel: "Cancel",
    required: "Select a hazard type and describe the problem.",
    gpsError:
      "Could not get your location. You can enter the location manually.",
    success:
      "Report saved on this device. It has not been independently verified.",
    share: "Share Report",
    copy: "Copy Report Text",
    copied: "Report text copied.",
    copyFallback:
      "Copy the text below and share it manually.",
    copyFailed:
      "Automatic copying is unavailable. Select and copy the text below.",
    noReport: "Submit a report before sharing.",
    unverified: "UNVERIFIED REPORT",
    close: "Close",
    accuracy: "GPS accuracy",
    meters: "metres",
    shareTitle: "Pothik Safety Report",
    locationMissing: "Location not provided",
    reportTime: "Reported at",
    gpsSelected: "GPS location captured",
    invalidCoords: "GPS coordinates unavailable",
  },

  bn: {
    button: "নিরাপত্তা সমস্যা জানান",
    title: "নিরাপত্তাজনিত সমস্যা রিপোর্ট করুন",
    subtitle:
      "রাস্তার সমস্যা জানিয়ে অন্য যাত্রীদের সতর্ক করতে সাহায্য করুন।",
    type: "সমস্যার ধরন",
    selectType: "সমস্যার ধরন নির্বাচন করুন",
    lighting: "সড়কে পর্যাপ্ত আলো নেই",
    harassment: "হয়রানি বা সন্দেহজনক পরিস্থিতি",
    accident: "দুর্ঘটনা বা সড়কের ঘটনা",
    waterlogging: "জলাবদ্ধতা বা বন্যা",
    roadDamage: "ক্ষতিগ্রস্ত বা বিপজ্জনক রাস্তা",
    traffic: "যানজট বা রাস্তা বন্ধ",
    other: "অন্যান্য নিরাপত্তাজনিত সমস্যা",
    severity: "ঝুঁকির মাত্রা",
    low: "কম",
    medium: "মাঝারি",
    high: "বেশি",
    location: "স্থান / এলাকার নাম",
    locationPlaceholder: "স্থানের নাম বা ঠিকানা লিখুন",
    gps: "বর্তমান GPS অবস্থান নিন",
    gettingGps: "অবস্থান নেওয়া হচ্ছে...",
    description: "সমস্যার বিবরণ",
    descriptionPlaceholder:
      "কী ঘটেছে? অন্য যাত্রীদের কী জানা প্রয়োজন?",
    anonymous: "আমার নাম প্রকাশ না করে রিপোর্ট করুন",
    submit: "রিপোর্ট জমা দিন",
    submitting: "জমা হচ্ছে...",
    cancel: "বাতিল",
    required: "সমস্যার ধরন নির্বাচন করুন এবং বিবরণ লিখুন।",
    gpsError:
      "বর্তমান অবস্থান পাওয়া যায়নি। আপনি নিজে জায়গার নাম লিখতে পারেন।",
    success:
      "রিপোর্ট এই ডিভাইসে সংরক্ষিত হয়েছে। এটি এখনো যাচাই করা হয়নি।",
    share: "রিপোর্ট শেয়ার করুন",
    copy: "রিপোর্টের লেখা কপি করুন",
    copied: "রিপোর্টের লেখা কপি হয়েছে।",
    copyFallback:
      "নিচের লেখাটি কপি করে নিজে শেয়ার করুন।",
    copyFailed:
      "স্বয়ংক্রিয়ভাবে কপি করা যায়নি। নিচের লেখা নির্বাচন করে কপি করুন।",
    noReport: "শেয়ার করার আগে একটি রিপোর্ট জমা দিন।",
    unverified: "যাচাই না করা রিপোর্ট",
    close: "বন্ধ করুন",
    accuracy: "GPS নির্ভুলতা",
    meters: "মিটার",
    shareTitle: "পাথিক নিরাপত্তা রিপোর্ট",
    locationMissing: "অবস্থান দেওয়া হয়নি",
    reportTime: "রিপোর্টের সময়",
    gpsSelected: "GPS অবস্থান পাওয়া গেছে",
    invalidCoords: "GPS স্থানাঙ্ক পাওয়া যায়নি",
  },
};

const HAZARDS = [
  ["lighting", "Poor street lighting", "সড়কে পর্যাপ্ত আলো নেই"],
  [
    "harassment",
    "Harassment or suspicious activity",
    "হয়রানি বা সন্দেহজনক পরিস্থিতি",
  ],
  ["accident", "Accident or road incident", "দুর্ঘটনা বা সড়কের ঘটনা"],
  ["waterlogging", "Waterlogging or flooding", "জলাবদ্ধতা বা বন্যা"],
  ["roadDamage", "Damaged or unsafe road", "ক্ষতিগ্রস্ত বা বিপজ্জনক রাস্তা"],
  ["traffic", "Traffic or road obstruction", "যানজট বা রাস্তা বন্ধ"],
  ["other", "Other safety concern", "অন্যান্য নিরাপত্তাজনিত সমস্যা"],
];

function readReports() {
  try {
    return JSON.parse(
      localStorage.getItem("pothik_safety_reports") || "[]"
    );
  } catch {
    return [];
  }
}

export default function SafetyHazardReport({
  language = "bn",
}) {
  const t = LANG[language] || LANG.bn;

  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [shareText, setShareText] = useState("");
  const [latestReport, setLatestReport] = useState(null);

  const [form, setForm] = useState({
    type: "",
    severity: "medium",
    location: "",
    description: "",
    anonymous: true,
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const getGpsLocation = () => {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage(t.gpsError);
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((previous) => ({
          ...previous,
          latitude,
          longitude,
          accuracy: Math.round(position.coords.accuracy),
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));

        setMessage(t.gpsSelected);
        setGpsLoading(false);
      },
      () => {
        setMessage(t.gpsError);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const makeShareText = (report) => {
    const hazard = HAZARDS.find(
      (item) => item[0] === report.type
    );

    const hazardName = hazard
      ? language === "bn"
        ? hazard[2]
        : hazard[1]
      : report.type;

    const severityName =
      language === "bn"
        ? report.severity === "high"
          ? "বেশি"
          : report.severity === "low"
          ? "কম"
          : "মাঝারি"
        : report.severity;

    const mapLink =
      report.latitude != null &&
      report.longitude != null
        ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
        : "";

    return [
      `Pothik | ${t.shareTitle}`,
      `${t.type}: ${hazardName}`,
      `${t.severity}: ${severityName}`,
      `${t.location}: ${report.location || t.locationMissing}`,
      `${t.description}: ${report.description}`,
      mapLink ? `Map: ${mapLink}` : "",
      `${t.reportTime}: ${new Date(report.createdAt).toLocaleString()}`,
      t.unverified,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const submitReport = (event) => {
    event.preventDefault();
    setMessage("");
    setShareText("");

    if (!form.type || !form.description.trim()) {
      setMessage(t.required);
      return;
    }

    setSubmitting(true);

    try {
      const report = {
        id:
          globalThis.crypto?.randomUUID?.() ||
          `report-${Date.now()}`,

        type: form.type,
        severity: form.severity,
        location: form.location.trim(),
        description: form.description.trim(),

        anonymous: form.anonymous,

        latitude: form.latitude,
        longitude: form.longitude,
        accuracy: form.accuracy,

        createdAt: new Date().toISOString(),
        status: "unverified",
      };

      const existingReports = readReports();

      localStorage.setItem(
        "pothik_safety_reports",
        JSON.stringify([
          report,
          ...existingReports,
        ].slice(0, 500))
      );

      setLatestReport(report);
      setShareText(makeShareText(report));
      setMessage(t.success);

      setForm({
        type: "",
        severity: "medium",
        location: "",
        description: "",
        anonymous: true,
        latitude: null,
        longitude: null,
        accuracy: null,
      });
    } catch (error) {
      console.error(error);
      setMessage(
        language === "bn"
          ? "রিপোর্ট সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"
          : "Could not save the report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const shareReport = async () => {
    if (!latestReport) {
      setMessage(t.noReport);
      return;
    }

    const text = makeShareText(latestReport);
    setShareText(text);

    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text,
        });

        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage(t.copied);
      } else {
        setMessage(t.copyFallback);
      }
    } catch {
      setMessage(t.copyFallback);
    }
  };

  const copyReport = async () => {
    if (!shareText) {
      setMessage(t.noReport);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setMessage(t.copied);
    } catch {
      setMessage(t.copyFallback);
    }
  };

  return (
    <>
      <style>{`
        .hazard-float-button {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 2900;
          border: 0;
          border-radius: 999px;
          padding: 15px 21px;
          background: linear-gradient(135deg, #b91c1c, #ef4444);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 12px 28px rgba(185, 28, 28, .28);
        }

        .hazard-float-button:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .hazard-overlay {
          position: fixed;
          inset: 0;
          z-index: 5100;
          display: grid;
          place-items: center;
          padding: 16px;
          background: rgba(8, 25, 44, .60);
          backdrop-filter: blur(5px);
        }

        .hazard-modal {
          width: min(560px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          padding: 23px;
          border-radius: 22px;
          background: #fff;
          color: #183d60;
          box-shadow: 0 25px 65px rgba(0, 0, 0, .25);
        }

        .hazard-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .hazard-head h2 {
          margin: 0;
          color: #173d60;
          font-size: 22px;
          font-weight: 950;
        }

        .hazard-subtitle {
          margin-top: 7px;
          color: #6b8398;
          font-size: 12px;
          line-height: 1.6;
        }

        .hazard-close {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 10px;
          background: #eef4f7;
          color: #37566d;
          font-weight: 900;
        }

        .hazard-form {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }

        .hazard-label {
          display: grid;
          gap: 7px;
          color: #47647c;
          font-size: 11px;
          font-weight: 850;
        }

        .hazard-input,
        .hazard-select,
        .hazard-textarea {
          width: 100%;
          min-height: 43px;
          padding: 10px 12px;
          border: 1px solid #d6e3eb;
          border-radius: 11px;
          outline: none;
          background: #fbfdff;
          color: #183d60;
          font-size: 12px;
        }

        .hazard-input:focus,
        .hazard-select:focus,
        .hazard-textarea:focus {
          border-color: #1675b4;
          box-shadow: 0 0 0 3px rgba(22, 117, 180, .10);
        }

        .hazard-textarea {
          min-height: 100px;
          resize: vertical;
          line-height: 1.6;
        }

        .hazard-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .hazard-gps {
          min-height: 39px;
          border: 1px solid #b8dce9;
          border-radius: 10px;
          padding: 9px 12px;
          color: #145b83;
          background: #eff9fd;
          font-size: 11px;
          font-weight: 850;
        }

        .hazard-check {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #536e83;
          font-size: 11px;
          line-height: 1.6;
        }

        .hazard-submit {
          min-height: 45px;
          border: 0;
          border-radius: 11px;
          color: white;
          background: linear-gradient(135deg, #0b619d, #1977b4);
          font-weight: 900;
        }

        .hazard-cancel {
          min-height: 42px;
          border: 1px solid #d8e4eb;
          border-radius: 11px;
          color: #48657b;
          background: white;
          font-weight: 850;
        }

        .hazard-message {
          margin-top: 13px;
          padding: 11px 12px;
          border-radius: 10px;
          background: #eff8f2;
          color: #17623d;
          font-size: 11px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .hazard-warning {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #f5d7a7;
          background: #fff8eb;
          color: #875819;
          font-size: 10px;
          line-height: 1.6;
        }

        .hazard-share-area {
          display: grid;
          gap: 9px;
          margin-top: 12px;
        }

        .hazard-share-text {
          width: 100%;
          min-height: 115px;
          resize: vertical;
          padding: 10px;
          border: 1px solid #d6e3eb;
          border-radius: 10px;
          color: #34546e;
          background: #f8fbfd;
          font-size: 10px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 650px) {
          .hazard-float-button {
            right: 12px;
            bottom: 12px;
            padding: 13px 15px;
            font-size: 11px;
          }

          .hazard-modal {
            padding: 17px;
          }

          .hazard-head h2 {
            font-size: 19px;
          }

          .hazard-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <button
        type="button"
        className="hazard-float-button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
      >
        ! {t.button}
      </button>

      {open && (
        <div
          className="hazard-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            className="hazard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hazard-title"
          >
            <div className="hazard-head">
              <div>
                <h2 id="hazard-title">
                  {t.title}
                </h2>

                <div className="hazard-subtitle">
                  {t.subtitle}
                </div>
              </div>

              <button
                className="hazard-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
              >
                X
              </button>
            </div>

            <form
              className="hazard-form"
              onSubmit={submitReport}
            >
              <label className="hazard-label">
                {t.type}

                <select
                  className="hazard-select"
                  value={form.type}
                  onChange={(event) =>
                    updateForm("type", event.target.value)
                  }
                  required
                >
                  <option value="">
                    {t.selectType}
                  </option>

                  {HAZARDS.map((hazard) => (
                    <option
                      key={hazard[0]}
                      value={hazard[0]}
                    >
                      {language === "bn"
                        ? hazard[2]
                        : hazard[1]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="hazard-label">
                {t.severity}

                <select
                  className="hazard-select"
                  value={form.severity}
                  onChange={(event) =>
                    updateForm(
                      "severity",
                      event.target.value
                    )
                  }
                >
                  <option value="low">
                    {t.low}
                  </option>

                  <option value="medium">
                    {t.medium}
                  </option>

                  <option value="high">
                    {t.high}
                  </option>
                </select>
              </label>

              <label className="hazard-label">
                {t.location}

                <input
                  className="hazard-input"
                  value={form.location}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      location: event.target.value,
                      latitude: null,
                      longitude: null,
                      accuracy: null,
                    }))
                  }
                  placeholder={t.locationPlaceholder}
                />
              </label>

              <button
                type="button"
                className="hazard-gps"
                onClick={getGpsLocation}
                disabled={gpsLoading}
              >
                {gpsLoading ? t.gettingGps : t.gps}
              </button>

              {form.accuracy != null && (
                <div className="hazard-subtitle">
                  {t.accuracy}: {form.accuracy} {t.meters}
                </div>
              )}

              <label className="hazard-label">
                {t.description}

                <textarea
                  className="hazard-textarea"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder={t.descriptionPlaceholder}
                  maxLength={1000}
                  required
                />
              </label>

              <label className="hazard-check">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(event) =>
                    updateForm(
                      "anonymous",
                      event.target.checked
                    )
                  }
                />

                <span>{t.anonymous}</span>
              </label>

              <button
                type="submit"
                className="hazard-submit"
                disabled={submitting}
              >
                {submitting ? t.submitting : t.submit}
              </button>

              <button
                type="button"
                className="hazard-cancel"
                onClick={() => setOpen(false)}
              >
                {t.cancel}
              </button>
            </form>

            {message && (
              <div className="hazard-message">
                {message}
              </div>
            )}

            {latestReport && (
              <div className="hazard-share-area">
                <button
                  type="button"
                  className="hazard-submit"
                  onClick={shareReport}
                >
                  {t.share}
                </button>

                <button
                  type="button"
                  className="hazard-cancel"
                  onClick={copyReport}
                >
                  {t.copy}
                </button>

                {shareText && (
                  <textarea
                    className="hazard-share-text"
                    readOnly
                    value={shareText}
                    onClick={(event) =>
                      event.currentTarget.select()
                    }
                  />
                )}
              </div>
            )}

            <div className="hazard-warning">
              {t.unverified}.{" "}
              {language === "bn"
                ? "জরুরি বিপদ হলে এই রিপোর্ট ব্যবস্থার জন্য অপেক্ষা না করে স্থানীয় জরুরি সেবায় যোগাযোগ করুন।"
                : "For an immediate danger, contact local emergency services instead of waiting for this report system."}
            </div>
          </section>
        </div>
      )}
    </>
  );
}