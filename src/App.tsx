import { useState } from "react";
import PipeMeasurement from "./PipeMeasurement";
import PipeDiagram from "./PipeDiagram";
import "./App.css";

export interface BoxFields {
  xDistance: string;
  minYDistance: string;
  maxYDistance: string;
}

export interface LowerBoxFields {
  height: string;
  xDistance: string;
  minYDistance: string;
  maxYDistance: string;
}

export interface PipeSection {
  id: "robot-origin" | "opposite";
  label: string;
  isActive: boolean;
  upperBox: BoxFields;
  lowerBox: LowerBoxFields;
}

const emptyBox = (): BoxFields => ({ xDistance: "", minYDistance: "", maxYDistance: "" });
const emptyLowerBox = (): LowerBoxFields => ({ height: "", xDistance: "", minYDistance: "", maxYDistance: "" });

const initialSections: PipeSection[] = [
  { id: "robot-origin", label: "ロボット原点側", isActive: true, upperBox: emptyBox(), lowerBox: emptyLowerBox() },
  { id: "opposite",     label: "反対側",         isActive: true, upperBox: emptyBox(), lowerBox: emptyLowerBox() },
];

function App() {
  const [sections, setSections] = useState<PipeSection[]>(initialSections);
  // "sectionId.boxType.fieldName"  e.g. "robot-origin.upperBox.xDistance"
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleUpdate = (updated: PipeSection) =>
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  const handleDelete = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)));

  const handleAdd = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: true } : s)));

  return (
    <div className="app-root">
      <div className="app-divider" />
      <div className="app-sidebar">
        <PipeMeasurement
          sections={sections}
          focusedField={focusedField}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onFieldFocus={setFocusedField}
          onFieldBlur={() => setFocusedField(null)}
        />
      </div>
      <div className="app-main">
        <PipeDiagram sections={sections} focusedField={focusedField} onRegionFocus={setFocusedField} />
      </div>
    </div>
  );
}

export default App;
