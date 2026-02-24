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
  { id: "robot-origin", label: "ロボット原点側 (Forward)", isActive: false, upperBox: emptyBox(), lowerBox: emptyLowerBox() },
  { id: "opposite",     label: "反対側 (Aft)",             isActive: false, upperBox: emptyBox(), lowerBox: emptyLowerBox() },
];

function App() {
  const [sections, setSections]       = useState<PipeSection[]>(initialSections);
  const [pipeAnswer, setPipeAnswer]   = useState<"unanswered" | "yes" | "no">("unanswered");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const activeField = focusedField ?? hoveredField;

  const handleUpdate = (updated: PipeSection) =>
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  const handleAdd = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: true } : s)));

  const handleDelete = (id: string) => {
    const next = sections.map((s) => (s.id === id ? { ...s, isActive: false } : s));
    setSections(next);
    // If both sections are now inactive, go back to the yes/no prompt
    if (next.every((s) => !s.isActive)) {
      setPipeAnswer("unanswered");
    }
  };

  const handleAnswer = (answer: "yes" | "no") => {
    setPipeAnswer(answer);
    // Reset sections to inactive when entering "yes" state so user explicitly adds each end
    if (answer === "yes") {
      setSections(initialSections.map((s) => ({ ...s, isActive: false })));
    }
  };

  // Hide diagram when user has confirmed no pipe
  const displaySections = pipeAnswer === "no" ? [] : sections;

  return (
    <div className="app-root">
      <div className="app-divider" />
      <div className="app-sidebar">
        <PipeMeasurement
          sections={sections}
          pipeAnswer={pipeAnswer}
          focusedField={activeField}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onAnswer={handleAnswer}
          onFieldFocus={setFocusedField}
          onFieldBlur={() => setFocusedField(null)}
          onFieldHover={setHoveredField}
          onFieldHoverEnd={() => setHoveredField(null)}
        />
      </div>
      <div className="app-main">
        <PipeDiagram sections={displaySections} focusedField={activeField} onRegionFocus={setFocusedField} />
      </div>
    </div>
  );
}

export default App;
