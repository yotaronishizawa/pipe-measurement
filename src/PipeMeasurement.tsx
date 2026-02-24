import React from "react";
import type { PipeSection, BoxFields, LowerBoxFields } from "./App";
import "./PipeMeasurement.css";

// ---- Icons ----

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1.75 3.5H12.25M5.25 3.5V2.625C5.25 2.27982 5.38828 1.94898 5.63442 1.70285C5.88055 1.45671 6.21139 1.31843 6.55657 1.31843H7.44343C7.78861 1.31843 8.11945 1.45671 8.36558 1.70285C8.61172 1.94898 8.75 2.27982 8.75 2.625V3.5M11.375 3.5L10.7917 11.375C10.7917 11.7202 10.6534 12.051 10.4073 12.2972C10.1611 12.5433 9.83029 12.6816 9.48511 12.6816H4.51489C4.16971 12.6816 3.83887 12.5433 3.59274 12.2972C3.3466 12.051 3.20833 11.7202 3.20833 11.375L2.625 3.5H11.375Z"
      stroke="#171717" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUp = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 5L5 1L9 5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDown = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 1V9M1 5H9" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---- InputField ----

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
}

const isValidNumber = (v: string) => v === "" || /^-?\d*\.?\d*$/.test(v);

const InputField: React.FC<InputFieldProps> = ({
  label, value, onChange, onFocus, onBlur, isFocused,
}) => {
  const hasError = value !== "" && !isValidNumber(value);

  const step = (delta: number) => {
    const current = parseFloat(value);
    const next = (isNaN(current) ? 0 : current) + delta;
    onChange(String(next));
  };

  return (
    <div className="pm-field">
      <label className={`pm-field__label${isFocused ? " pm-field__label--focused" : ""}`}>
        {label}
      </label>
      <div className="pm-field__input-row">
        <input
          className={[
            "pm-field__input",
            hasError ? "pm-field__input--error" : "",
            isFocused ? "pm-field__input--focused" : "",
          ].join(" ").trim()}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <div className="pm-field__steppers">
          <button
            className="pm-field__step-btn"
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onFocus(); step(1); }}
          >
            <ChevronUp />
          </button>
          <button
            className="pm-field__step-btn"
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onFocus(); step(-1); }}
          >
            <ChevronDown />
          </button>
        </div>
      </div>
      {hasError && <span className="pm-field__error">Invalid</span>}
    </div>
  );
};

// ---- Active section ----

interface SectionCardProps {
  section: PipeSection;
  focusedField: string | null;
  onUpdate: (updated: PipeSection) => void;
  onDelete: (id: string) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section, focusedField, onUpdate, onDelete, onFieldFocus, onFieldBlur,
}) => {
  const sid = section.id;
  const fid = (path: string) => `${sid}.${path}`;
  // exact match (form focus) OR prefix match (diagram click e.g. "robot-origin.upperBox")
  const isF = (path: string) => {
    const fullId = fid(path);
    return !!focusedField && (fullId === focusedField || fullId.startsWith(focusedField + "."));
  };

  const setUpper = (key: keyof BoxFields) => (v: string) =>
    onUpdate({ ...section, upperBox: { ...section.upperBox, [key]: v } });
  const setLower = (key: keyof LowerBoxFields) => (v: string) =>
    onUpdate({ ...section, lowerBox: { ...section.lowerBox, [key]: v } });

  const field = (
    label: string, value: string, onChange: (v: string) => void, path: string,
  ) => (
    <InputField
      label={label} value={value} onChange={onChange}
      onFocus={() => onFieldFocus(fid(path))}
      onBlur={onFieldBlur}
      isFocused={isF(path)}
    />
  );

  return (
    <div className="pm-section">
      <div className="pm-section__header">
        <span className="pm-section__title">{section.label}</span>
        <button className="pm-section__delete-btn" onClick={() => onDelete(sid)} type="button">
          <TrashIcon /><span>削除</span>
        </button>
      </div>

      <div className="pm-input-group">
        <div className="pm-input-group__title">上ボックス</div>
        <div className="pm-input-group__fields">
          {field("上ボックスX距離",    section.upperBox.xDistance,    setUpper("xDistance"),    "upperBox.xDistance")}
          {field("上ボックス最小Y距離", section.upperBox.minYDistance,  setUpper("minYDistance"), "upperBox.minYDistance")}
          {field("上ボックス最大Y距離", section.upperBox.maxYDistance,  setUpper("maxYDistance"), "upperBox.maxYDistance")}
        </div>
      </div>

      <div className="pm-input-group">
        <div className="pm-input-group__title">下ボックス</div>
        <div className="pm-input-group__fields">
          {field("下ボックス高",       section.lowerBox.height,       setLower("height"),       "lowerBox.height")}
          {field("下ボックスX距離",    section.lowerBox.xDistance,    setLower("xDistance"),    "lowerBox.xDistance")}
          {field("下ボックス最小Y距離", section.lowerBox.minYDistance,  setLower("minYDistance"), "lowerBox.minYDistance")}
          {field("下ボックス最大Y距離", section.lowerBox.maxYDistance,  setLower("maxYDistance"), "lowerBox.maxYDistance")}
        </div>
      </div>
    </div>
  );
};

// ---- Collapsed (deleted) section ----

const CollapsedCard: React.FC<{ label: string; onAdd: () => void }> = ({ label, onAdd }) => (
  <div className="pm-section pm-section--collapsed">
    <span className="pm-section__title">{label}</span>
    <button className="pm-section__add-btn" onClick={onAdd} type="button">
      <PlusIcon /><span>パイプを追加</span>
    </button>
  </div>
);

// ---- Main component ----

export interface PipeMeasurementProps {
  sections: PipeSection[];
  focusedField: string | null;
  onUpdate: (updated: PipeSection) => void;
  onDelete: (id: string) => void;
  onAdd: (id: string) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
}

const PipeMeasurement: React.FC<PipeMeasurementProps> = ({
  sections, focusedField, onUpdate, onDelete, onAdd, onFieldFocus, onFieldBlur,
}) => (
  <div className="pm-panel">
    <div className="pm-header">
      <span className="pm-header__title">パイプ</span>
      <span className="pm-header__subtitle">2パイプ</span>
    </div>
    {sections.map((s) =>
      s.isActive ? (
        <SectionCard
          key={s.id} section={s} focusedField={focusedField}
          onUpdate={onUpdate} onDelete={onDelete}
          onFieldFocus={onFieldFocus} onFieldBlur={onFieldBlur}
        />
      ) : (
        <CollapsedCard key={s.id} label={s.label} onAdd={() => onAdd(s.id)} />
      )
    )}
  </div>
);

export default PipeMeasurement;
