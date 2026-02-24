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
  pipePresent: "unanswered" | "yes" | "no";
  upperBox: BoxFields;
  lowerBox: LowerBoxFields;
}

const emptyBox = (): BoxFields => ({ xDistance: "", minYDistance: "", maxYDistance: "" });
const emptyLowerBox = (): LowerBoxFields => ({ height: "", xDistance: "", minYDistance: "", maxYDistance: "" });

const initialSections: PipeSection[] = [
  { id: "robot-origin", label: "ロボット原点側 (Forward)", pipePresent: "unanswered", upperBox: emptyBox(), lowerBox: emptyLowerBox() },
  { id: "opposite",     label: "反対側 (Aft)",             pipePresent: "unanswered", upperBox: emptyBox(), lowerBox: emptyLowerBox() },
];

function App() {
  const [sections, setSections] = useState<PipeSection[]>(initialSections);
  // "sectionId.boxType.fieldName"  e.g. "robot-origin.upperBox.xDistance"
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  // Focus takes priority over hover for the active highlight
  const activeField = focusedField ?? hoveredField;

  const handleUpdate = (updated: PipeSection) =>
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  // Trash can → go back to unanswered prompt
  const handleDelete = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, pipePresent: "unanswered" } : s)));

  const handleAnswer = (id: string, answer: "yes" | "no") =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, pipePresent: answer } : s)));

  return (
    <div className="app-root">
      <div className="app-divider" />
      <div className="app-sidebar">
        <PipeMeasurement
          sections={sections}
          focusedField={activeField}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAnswer={handleAnswer}
          onFieldFocus={setFocusedField}
          onFieldBlur={() => setFocusedField(null)}
          onFieldHover={setHoveredField}
          onFieldHoverEnd={() => setHoveredField(null)}
        />
      </div>
      <div className="app-main">
        <PipeDiagram sections={sections} focusedField={activeField} onRegionFocus={setFocusedField} />
      </div>
    </div>
  );
}

export default App;
