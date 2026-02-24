import React from "react";
import type { PipeSection } from "./App";
import robotEmptySvg    from "./section-robot-empty.svg";
import oppositeEmptySvg from "./section-opposite-empty.svg";
import "./PipeDiagram.css";

// ─── Fixed layout constants (extracted from original SVGs) ────────────────────

// Z axis
const UPPER_BOX_TOP = 97;    // fixed top of upper box (bottom always = lower box top)
const DS_ORIGIN_Y   = 492;   // y-position of DS origin point
const AREA_TOP      = 148.5; // top of SS / DS bounding areas
const AREA_H        = 343;   // height of SS / DS areas

// Real-world scale: SS/DS physical height ≈ 1900 mm → AREA_H px
const SCALE   = AREA_H / 1900;           // px per mm
const mmToPx  = (mm: number) => mm * SCALE;

// ── Robot-origin: DS is to the RIGHT of the pipe ─────────────────────────────
const R_DS_ORIGIN_X = 292;
const R_SS = { x: 16.5,    w: 139 }; // SS area (left side)
const R_DS = { x: 280.5,   w: 134 }; // DS area (right side)

// ── Opposite: DS is to the LEFT of the pipe ──────────────────────────────────
const O_DS_ORIGIN_X = 140;
const O_DS = { x: 16.5,    w: 134 }; // DS area (left side)
const O_SS = { x: 280.499, w: 139 }; // SS area (right side)

// Divider between front view and side view
const DIVIDER_X = 464;

// Side view
const R_WALL_X = 512; // robot: wall left edge (pipe extends RIGHT from right face = 525)
const O_WALL_X = 547; // opposite: wall left face (pipe extends LEFT from here)
const WALL_W   = 13;
const WALL_TOP = 97;
const WALL_H   = 395;

// Default values in mm (derived from original SVG px values via 1900/343 factor)
const R_DEF = {
  upperXDist:  83, upperMinY: 255, upperMaxY: 476,
  lowerH:     410, lowerXDist: 166, lowerMinY: 255, lowerMaxY: 676,
};
const O_DEF = {
  upperXDist:  83, upperMinY: 233, upperMaxY: 454,
  lowerH:     410, lowerXDist: 166, lowerMinY: 233, lowerMaxY: 654,
};

// Colors
const C_UPPER = "#858585";
const C_LOWER = "#5C5C5C";
const C_SS    = "rgba(214,221,232,0.5)";
const C_DS    = "rgba(253,221,183,0.5)";
const C_WALL  = "#E4E4E7";
const C_DASH  = "#9CA3AF";
const C_LINE  = "#6B7280";
const C_VLINE = "#9CA3AF";
const C_DOT   = "#FF8308";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Use `fallback` when the field is empty; otherwise parse the number.
function parse(v: string, fallback: number): number {
  const trimmed = v.trim();
  if (!trimmed) return fallback;
  const n = parseFloat(trimmed);
  return isNaN(n) ? fallback : n;
}

// ─── Per-section dynamic SVG ─────────────────────────────────────────────────

interface SectionSvgProps {
  section: PipeSection;
  focusedField: string | null;
  onRegionFocus: (id: string | null) => void;
}

// ─── Dimension-line highlight ─────────────────────────────────────────────────

const HL_COLOR = "#FF8308";
const TICK = 5;

const DimLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number; label: string;
}> = ({ x1, y1, x2, y2, label }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return null;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const isH = Math.abs(dx) >= Math.abs(dy);
  const lw = label.length * 7 + 8;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={HL_COLOR} strokeWidth="1.5" />
      {isH ? (
        <>
          <line x1={x1} y1={y1 - TICK} x2={x1} y2={y1 + TICK} stroke={HL_COLOR} strokeWidth="1.5" />
          <line x1={x2} y1={y2 - TICK} x2={x2} y2={y2 + TICK} stroke={HL_COLOR} strokeWidth="1.5" />
          <rect x={mx - lw / 2} y={my - 19} width={lw} height={14} fill="white" opacity="0.9" rx="2" />
          <text x={mx} y={my - 12} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontFamily="Inter, sans-serif" fill={HL_COLOR} fontWeight="700"
          >{label}</text>
        </>
      ) : (
        <>
          <line x1={x1 - TICK} y1={y1} x2={x1 + TICK} y2={y1} stroke={HL_COLOR} strokeWidth="1.5" />
          <line x1={x2 - TICK} y1={y2} x2={x2 + TICK} y2={y2} stroke={HL_COLOR} strokeWidth="1.5" />
          <rect x={mx + 5} y={my - 8} width={lw} height={14} fill="white" opacity="0.9" rx="2" />
          <text x={mx + 8} y={my} textAnchor="start" dominantBaseline="middle"
            fontSize="11" fontFamily="Inter, sans-serif" fill={HL_COLOR} fontWeight="700"
          >{label}</text>
        </>
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const SectionSvg: React.FC<SectionSvgProps> = ({ section, focusedField, onRegionFocus }) => {
  const isR = section.id === "robot-origin";
  const DEF = isR ? R_DEF : O_DEF;

  // Resolve every input in mm (empty → default mm, invalid → default mm)
  const uMinYmm = parse(section.upperBox.minYDistance, DEF.upperMinY);
  const uMaxYmm = parse(section.upperBox.maxYDistance, DEF.upperMaxY);
  const uXmm    = parse(section.upperBox.xDistance,    DEF.upperXDist);
  const lHmm    = parse(section.lowerBox.height,       DEF.lowerH);
  const lMinYmm = parse(section.lowerBox.minYDistance, DEF.lowerMinY);
  const lMaxYmm = parse(section.lowerBox.maxYDistance, DEF.lowerMaxY);
  const lXmm    = parse(section.lowerBox.xDistance,    DEF.lowerXDist);

  // Convert mm → px for rendering
  const uMinY = mmToPx(uMinYmm);
  const uMaxY = mmToPx(uMaxYmm);
  const uX    = mmToPx(uXmm);
  const lH    = mmToPx(lHmm);
  const lMinY = mmToPx(lMinYmm);
  const lMaxY = mmToPx(lMaxYmm);
  const lX    = mmToPx(lXmm);

  const dsOx = isR ? R_DS_ORIGIN_X : O_DS_ORIGIN_X;

  // ── Front view: horizontal (Y-axis) box positions ────────────────────────
  //
  // Robot (DS on right):
  //   DS-side face (right) = dsOx − minY
  //   SS-side face (left)  = dsOx − maxY   →  boxX = dsOx − maxY
  //
  // Opposite (DS on left):
  //   DS-side face (left)  = dsOx + minY   →  boxX = dsOx + minY
  //   SS-side face (right) = dsOx + maxY
  //
  const uBoxX = isR ? dsOx - uMaxY : dsOx + uMinY;
  const uBoxW = Math.max(0, uMaxY - uMinY);

  const lBoxX = isR ? dsOx - lMaxY : dsOx + lMinY;
  const lBoxW = Math.max(0, lMaxY - lMinY);

  const lBoxH = Math.max(0, lH);
  const lBoxY = DS_ORIGIN_Y - lBoxH; // lower box bottom is always at DS_ORIGIN_Y

  // Upper box: top is fixed; bottom always touches the lower box top
  const uBoxH = Math.max(0, lBoxY - UPPER_BOX_TOP);

  // ── Side view: depth (X-axis) box positions ───────────────────────────────
  //
  // Robot: pipe extends RIGHT from wall right face (= R_WALL_X + WALL_W = 525)
  // Opposite: pipe extends LEFT from wall left face (= O_WALL_X = 547)
  //
  const wallFace = isR ? R_WALL_X + WALL_W : O_WALL_X;
  const wallX    = isR ? R_WALL_X          : O_WALL_X;

  const uSideX = isR ? wallFace : wallFace - uX;
  const lSideX = isR ? wallFace : wallFace - lX;

  // ── Measurement lines ─────────────────────────────────────────────────────
  const ss = isR ? R_SS : O_SS;
  const ds = isR ? R_DS : O_DS;

  // Front view horizontal baseline: spans leftmost to rightmost area edge
  const frontLineLeft  = Math.min(ss.x, ds.x);
  const frontLineRight = Math.max(ss.x + ss.w, ds.x + ds.w);

  // Side view horizontal baseline: wall far edge → max pipe extent + margin
  const maxXDist     = Math.max(uX, lX);
  const SIDE_MARGIN  = 18;
  const sideLineLeft  = isR ? wallX                         : wallFace - maxXDist - SIDE_MARGIN;
  const sideLineRight = isR ? wallFace + maxXDist + SIDE_MARGIN : wallX + WALL_W;

  // Vertical reference line through DS origin
  const vTop = AREA_TOP + 1;
  const vBot = DS_ORIGIN_Y - 5;

  // ── Axis labels ───────────────────────────────────────────────────────────
  const AY       = 70;  // y-position of all axis labels
  const FRONT_AX = 17;  // x-start of front view labels
  const SIDE_AX  = DIVIDER_X + 50; // x-start of side view labels
  const GAP      = 53;  // spacing between labels

  // Front view labels (Y-Z plane)
  // Robot:    ×-X (red)  →+Y (green)  ↑+Z (blue)
  // Opposite: ×+X (red)  ←+Y (green)  ↑+Z (blue)
  const frontAxis = isR
    ? [{ t: "×-X", c: "#E11F21" }, { t: "→+Y", c: "#00A442" }, { t: "↑+Z", c: "#4159F8" }]
    : [{ t: "×+X", c: "#E11F21" }, { t: "←+Y", c: "#00A442" }, { t: "↑+Z", c: "#4159F8" }];

  // Side view labels (X-Z plane)
  // Robot:    →+X (red)  ×+Y (green)  ↑+Z (blue)
  // Opposite: ←-X (red)  ×+Y (green)  ↑+Z (blue)
  const sideAxis = isR
    ? [{ t: "→+X", c: "#E11F21" }, { t: "×+Y", c: "#00A442" }, { t: "↑+Z", c: "#4159F8" }]
    : [{ t: "←-X", c: "#E11F21" }, { t: "×+Y", c: "#00A442" }, { t: "↑+Z", c: "#4159F8" }];

  // ── Highlight (focused field) ─────────────────────────────────────────────
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const uZc = UPPER_BOX_TOP + uBoxH / 2;          // Z-center of upper box
  const lZc = lBoxY + lBoxH / 2;                  // Z-center of lower box
  const lYc = lBoxW > 0 ? lBoxX + lBoxW / 2 : dsOx; // Y-center of lower box

  const highlight = (() => {
    const prefix = `${section.id}.`;
    if (!focusedField?.startsWith(prefix)) return null;
    const field = focusedField.slice(prefix.length);
    switch (field) {
      case "upperBox.xDistance":
        return isR
          ? <DimLine x1={wallFace} y1={uZc} x2={wallFace + uX} y2={uZc} label={fmt(uXmm)} />
          : <DimLine x1={wallFace - uX} y1={uZc} x2={wallFace} y2={uZc} label={fmt(uXmm)} />;
      case "upperBox.minYDistance":
        return isR
          ? <DimLine x1={dsOx - uMinY} y1={uZc} x2={dsOx} y2={uZc} label={fmt(uMinYmm)} />
          : <DimLine x1={dsOx} y1={uZc} x2={dsOx + uMinY} y2={uZc} label={fmt(uMinYmm)} />;
      case "upperBox.maxYDistance":
        return isR
          ? <DimLine x1={dsOx - uMaxY} y1={uZc} x2={dsOx} y2={uZc} label={fmt(uMaxYmm)} />
          : <DimLine x1={dsOx} y1={uZc} x2={dsOx + uMaxY} y2={uZc} label={fmt(uMaxYmm)} />;
      case "lowerBox.height":
        return <DimLine x1={lYc} y1={lBoxY} x2={lYc} y2={DS_ORIGIN_Y} label={fmt(lHmm)} />;
      case "lowerBox.xDistance":
        return isR
          ? <DimLine x1={wallFace} y1={lZc} x2={wallFace + lX} y2={lZc} label={fmt(lXmm)} />
          : <DimLine x1={wallFace - lX} y1={lZc} x2={wallFace} y2={lZc} label={fmt(lXmm)} />;
      case "lowerBox.minYDistance":
        return isR
          ? <DimLine x1={dsOx - lMinY} y1={lZc} x2={dsOx} y2={lZc} label={fmt(lMinYmm)} />
          : <DimLine x1={dsOx} y1={lZc} x2={dsOx + lMinY} y2={lZc} label={fmt(lMinYmm)} />;
      case "lowerBox.maxYDistance":
        return isR
          ? <DimLine x1={dsOx - lMaxY} y1={lZc} x2={dsOx} y2={lZc} label={fmt(lMaxYmm)} />
          : <DimLine x1={dsOx} y1={lZc} x2={dsOx + lMaxY} y2={lZc} label={fmt(lMaxYmm)} />;
      default:
        return null;
    }
  })();

  const uGroup = `${section.id}.upperBox`;
  const lGroup = `${section.id}.lowerBox`;

  return (
    <svg
      className="pd-section-img"
      viewBox="0 0 1106 508"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => onRegionFocus(null)}
    >
      {/* Outer border */}
      <rect x="0.5" y="0.5" width="1105" height="507" rx="3.5" stroke="#E5E5E5" />

      {/* Section title */}
      <text
        x="16" y="36"
        fontFamily="Inter, 'Noto Sans JP', sans-serif"
        fontWeight="bold" fontSize="14" fill="black"
      >
        {section.label}
      </text>

      {/* ═══ FRONT VIEW (Y-Z plane) ════════════════════════════════════════ */}

      {/* Axis labels */}
      {frontAxis.map((a, i) => (
        <text
          key={i}
          x={FRONT_AX + i * GAP} y={AY}
          fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="16"
          fill={a.c}
        >
          {a.t}
        </text>
      ))}

      {/* SS area (fixed) */}
      <rect
        x={ss.x} y={AREA_TOP} width={ss.w} height={AREA_H}
        fill={C_SS} stroke={C_DASH} strokeDasharray="2 2"
      />
      <text
        x={ss.x + ss.w / 2} y={AREA_TOP + AREA_H / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="14" fill="#773710"
      >
        SS
      </text>

      {/* DS area (fixed) */}
      <rect
        x={ds.x} y={AREA_TOP} width={ds.w} height={AREA_H}
        fill={C_DS} stroke={C_DASH} strokeDasharray="2 2"
      />
      <text
        x={ds.x + ds.w / 2} y={AREA_TOP + AREA_H / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="14" fill="black"
      >
        DS
      </text>

      {/* Upper box — front view (variable X position, width & height clipped by lower box) */}
      {uBoxW > 0 && uBoxH > 0 && (
        <rect
          x={uBoxX} y={UPPER_BOX_TOP}
          width={uBoxW} height={uBoxH}
          fill={C_UPPER}
        />
      )}

      {/* Lower box — front view (variable X position, width, and height) */}
      {lBoxW > 0 && lBoxH > 0 && (
        <rect
          x={lBoxX} y={lBoxY}
          width={lBoxW} height={lBoxH}
          fill={C_LOWER}
        />
      )}

      {/* DS origin dot (fixed) */}
      <circle cx={dsOx} cy={DS_ORIGIN_Y} r="4" fill={C_DOT} />

      {/* Vertical reference line through DS origin */}
      <line
        x1={dsOx + 0.5} y1={vTop}
        x2={dsOx + 0.5} y2={vBot}
        stroke={C_VLINE}
      />

      {/* Front view horizontal baseline (spans full SS+DS area) */}
      <line
        x1={frontLineLeft}  y1={DS_ORIGIN_Y - 0.5}
        x2={frontLineRight} y2={DS_ORIGIN_Y - 0.5}
        stroke={C_LINE}
      />

      {/* ═══ DIVIDER ══════════════════════════════════════════════════════ */}
      <line x1={DIVIDER_X} y1={50} x2={DIVIDER_X} y2={DS_ORIGIN_Y} stroke="#D1D5DB" />

      {/* ═══ SIDE VIEW (X-Z plane) ════════════════════════════════════════ */}

      {/* Axis labels */}
      {sideAxis.map((a, i) => (
        <text
          key={i}
          x={SIDE_AX + i * GAP} y={AY}
          fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="16"
          fill={a.c}
        >
          {a.t}
        </text>
      ))}

      {/* Wall (fixed) */}
      <rect x={wallX} y={WALL_TOP} width={WALL_W} height={WALL_H} fill={C_WALL} />

      {/* Upper box — side view (variable width = upperXDist, height clipped by lower box) */}
      {uX > 0 && uBoxH > 0 && (
        <rect
          x={uSideX} y={UPPER_BOX_TOP}
          width={uX} height={uBoxH}
          fill={C_UPPER}
        />
      )}

      {/* Lower box — side view (variable width = lowerXDist, same height as front) */}
      {lX > 0 && lBoxH > 0 && (
        <rect
          x={lSideX} y={lBoxY}
          width={lX} height={lBoxH}
          fill={C_LOWER}
        />
      )}

      {/* Side view horizontal baseline (dynamic: extends to max pipe X extent) */}
      <line
        x1={sideLineLeft}  y1={DS_ORIGIN_Y - 0.5}
        x2={sideLineRight} y2={DS_ORIGIN_Y - 0.5}
        stroke={C_LINE}
      />

      {/* Clickable overlays — upper box (front + side) */}
      {uBoxW > 0 && uBoxH > 0 && (
        <rect x={uBoxX} y={UPPER_BOX_TOP} width={uBoxW} height={uBoxH}
          fill="transparent" style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onRegionFocus(uGroup); }}
        />
      )}
      {uX > 0 && uBoxH > 0 && (
        <rect x={uSideX} y={UPPER_BOX_TOP} width={uX} height={uBoxH}
          fill="transparent" style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onRegionFocus(uGroup); }}
        />
      )}

      {/* Clickable overlays — lower box (front + side) */}
      {lBoxW > 0 && lBoxH > 0 && (
        <rect x={lBoxX} y={lBoxY} width={lBoxW} height={lBoxH}
          fill="transparent" style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onRegionFocus(lGroup); }}
        />
      )}
      {lX > 0 && lBoxH > 0 && (
        <rect x={lSideX} y={lBoxY} width={lX} height={lBoxH}
          fill="transparent" style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onRegionFocus(lGroup); }}
        />
      )}

      {/* Highlight dimension line */}
      {highlight}
    </svg>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface PipeDiagramProps {
  sections: PipeSection[];
  focusedField: string | null;
  onRegionFocus: (id: string | null) => void;
}

const PipeDiagram: React.FC<PipeDiagramProps> = ({ sections, focusedField, onRegionFocus }) => (
  <div className="pd-card">
    <span className="pd-title">パイプ</span>
    <div className="pd-sections">
      {sections.map((s) => {
        if (s.pipePresent === "yes") {
          return (
            <SectionSvg key={s.id} section={s} focusedField={focusedField} onRegionFocus={onRegionFocus} />
          );
        }
        if (s.pipePresent === "no") {
          return null; // form side already shows the "no pipe" message
        }
        // unanswered: show empty placeholder SVG
        return (
          <img
            key={s.id}
            src={s.id === "robot-origin" ? robotEmptySvg : oppositeEmptySvg}
            alt={s.label}
            className="pd-section-img"
          />
        );
      })}
    </div>
  </div>
);

export default PipeDiagram;
