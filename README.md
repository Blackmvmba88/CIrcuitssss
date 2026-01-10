<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ⚡ CircuitSense Elite

> **A cognitive electronics laboratory for the modern maker**  
> Think. Simulate. Document. Build. Export. Touch matter.

---

## 🎯 Vision

**CircuitSense** is a visual electronics workbench that bridges the gap between digital thought and physical creation. It's where makers, students, and engineers can **capture knowledge** that would otherwise be lost—connections, measurements, theories, test points, diagnostic flows—and transform abstract circuits into documented, understood, real-world projects.

We're not just another circuit editor. We're building a **cognitive assistant** that understands electronics at multiple levels: from component identification to thermal analysis, from fault diagnosis to educational pedagogy.

---

## 🧬 Why This Exists

**The Problem:**  
Most makers and students don't document their work. Projects become "mystery boxes"—lost connections, forgotten component values, undocumented test procedures, scattered insights. When something breaks or needs modification months later, all that institutional knowledge is gone.

**Our Solution:**  
CircuitSense acts as your **permanent lab partner** that:
- Never forgets where probes should go
- Documents every measurement in context
- Explains the "why" behind each component
- Guides repair workflows with AI-powered diagnostics
- Exports everything—from BOMs to PDFs to 3D models

**For who:**
- 🎓 **Students** learning electronics who need guided, contextual education
- 🛠️ **Makers** prototyping hardware who want their work documented automatically  
- 🔧 **Repair Technicians** diagnosing faulty boards with AI assistance
- 👨‍🏫 **Educators** teaching circuit theory with interactive, visual feedback

---

## 📚 Project Vocabulary

Understanding the language of CircuitSense:

| Term | Definition |
|------|------------|
| **Board** | The PCB or circuit being analyzed—locked in spatial coordinates via AR |
| **Component** | Physical elements (ICs, resistors, capacitors) with functional roles |
| **Net** | Electrical connections (GND, VCC, SIGNAL) traced across the board |
| **Test Point** | Strategic measurement locations for probing |
| **Probe Step** | Guided measurement with expected ranges and fault theories |
| **Logic Flow** | Functional stages of the circuit (e.g., Power → Regulation → Processing) |
| **Persona** | AI expert mode (Senior Engineer, Hacker, Professor, Old School Tech) |
| **Thermal Signature** | Heuristic heat mapping for component diagnostics |
| **Diagnostic Log** | Historical audit trail of all measurements |
| **Topology** | Complete structural understanding of board layout |
| **Causal Role** | The "why"—what each component contributes to the system |

---

## 🎨 Experience Layers

CircuitSense operates at multiple levels of engagement:

### 🎓 **Learn**
- Expert personas teach concepts in different styles (professor, hacker, engineer)
- Causal explanations: not just "what", but "why this component exists"
- Interactive guided workflows with voice feedback

### 🔬 **Analyze**
- Real-time component identification via computer vision
- Automatic net tracing and categorization
- Thermal anomaly detection
- Complexity estimation (easy/moderate/advanced)

### 📏 **Measure**
- Step-by-step probing guides with visual overlays
- Expected value ranges with fault theories
- OCR multimeter reading capture
- Pass/fail validation with diagnostic logging

### 🛠️ **Repair**
- AI-powered fault diagnosis
- Component-level failure analysis
- Safety warnings and precautions
- Sequential repair workflows

### 📝 **Document**
- Automatic annotation of components and nets
- Visual snapshots with AR overlays
- Historical measurement logs
- Export-ready project states

### 🌐 **Share**
*(Coming soon)*
- Export to PDF with annotated diagrams
- Generate Bill of Materials (BOM)
- Markdown documentation export
- Project JSON for collaboration
- 3D visualization exports

---

## 🏗️ Technical Architecture

### Core Modes
- **Inspection** 🔍 — Component identification and board topology
- **Measurement** 📏 — Guided probing with diagnostic workflows
- **Repair** 🛠️ — Fault analysis and fix procedures
- **Validation** ✅ — Post-repair verification testing
- **Tutorial** 💡 — Educational mode with causal teaching
- **Thermal** 🔥 — Heat signature analysis for fault detection

### AI Personas
Each persona provides domain-specific expertise:
- 👨‍🔬 **Senior Engineer** — Precise, methodical, standards-focused
- 🧑‍💻 **Hardware Hacker** — Creative, experimental, practical shortcuts
- 🎓 **Professor** — Pedagogical, theory-rich, concept-driven
- 🛠️ **Old School Tech** — Battle-tested wisdom, analog-first thinking

### Technology Stack
- **Frontend:** React 19 + TypeScript + Vite
- **AI Vision:** Google Gemini API for multimodal analysis
- **AR Overlay:** Real-time spatial coordinate mapping
- **State Management:** React hooks with diagnostic history
- **Voice:** Web Speech API for auditory guidance

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Gemini API key ([get one here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Blackmvmba88/CIrcuitssss.git
cd CIrcuitssss

# Install dependencies
npm install

# Configure your API key
# Create a .env.local file and add:
# GEMINI_API_KEY=your_key_here

# Run locally
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎯 Roadmap

### 🟢 **Phase 1: Foundation** (Current)
- [x] AR component identification
- [x] Multi-persona AI guidance
- [x] Guided measurement workflows
- [x] Diagnostic logging
- [x] Real-time visual overlays
- [ ] Multimeter OCR refinement
- [ ] Thermal imaging integration

### 🟡 **Phase 2: Intelligence** (Next 3-6 months)
- [ ] Auto-generated repair procedures
- [ ] PCB reverse engineering mode
- [ ] Schematic extraction from board photos
- [ ] Component datasheet integration
- [ ] Collaborative annotations
- [ ] Export system (PDF, BOM, Markdown)

### 🔵 **Phase 3: Expansion** (6-12 months)
- [ ] 3D circuit visualization
- [ ] Mechanical integration (motors, servos)
- [ ] Simulation engine (SPICE integration)
- [ ] Mobile AR app (iOS/Android)
- [ ] Cloud project storage
- [ ] Community board library

### 🟣 **Phase 4: Matter** (Long-term Vision)
- [ ] PCB design tool integration
- [ ] 3D printable enclosures
- [ ] Direct fabrication export (Gerber, STL)
- [ ] RC/drone project templates
- [ ] Physical prototyping workflows
- [ ] Hardware-in-the-loop testing

---

## 🎨 Design Philosophy

**Technical Beauty**  
We believe engineering tools should be both powerful and beautiful. CircuitSense uses:
- High-contrast, low-saturation palettes for reduced eye strain
- Geometric iconography inspired by technical diagrams
- Monospaced typography for precision data
- Subtle animations that guide without distracting
- AR overlays that enhance, not obscure

**Narrative Interface**  
The app speaks to you:
- "This node isn't documented" 
- "Looks like a voltage regulator—want to probe the output?"
- "Thermal anomaly detected at U3"

These gentle nudges make users smarter without feeling patronized.

---

## 💾 Export Capabilities

*(In Development)*

When complete, CircuitSense will export:

| Format | Content |
|--------|---------|
| **PDF** | Annotated board diagrams with measurement logs |
| **Markdown** | Project documentation with embedded images |
| **JSON** | Complete project state for version control |
| **BOM** | Bill of Materials with sources and specs |
| **Images** | High-res snapshots with AR overlays |
| **ZIP** | Complete project package for sharing |

---

## 🌌 The Long Vision

From **images** → **3D figures** → **mechanical motion** → **textures** → **video games** → **special effects** → **real design** → **prototypes** → **RC control** → **physical scale**

CircuitSense is the first step in a creative universe that connects:
- **Digital thought** (simulation, documentation)
- **Electronic reality** (circuits, sensors, signals)  
- **Mechanical embodiment** (motors, drones, robots)
- **Human understanding** (pedagogy, collaboration)

It's not just a tool—it's a **laboratory for making ideas tangible**.

---

## 🐍 About BlackMamba

This project is part of a larger creative ecosystem spanning music, hardware, apps, and brand design. CircuitSense represents the intersection of technical precision and artistic vision—where engineering meets storytelling.

**Philosophy:**  
Technology should empower, educate, and inspire. Every line of code is a choice. Every interface is a conversation. Every project is a thread in a larger tapestry.

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🤝 Contributing

We're in quantum superposition—the project can become many things. Interested in shaping its future?

- 🐛 Report bugs via [Issues](https://github.com/Blackmvmba88/CIrcuitssss/issues)
- 💡 Suggest features via [Discussions](https://github.com/Blackmvmba88/CIrcuitssss/discussions)
- 🔧 Submit PRs (see [CONTRIBUTING.md](CONTRIBUTING.md) when available)

**Areas we're exploring:**
- Educational content creation
- Additional AI personas
- Export format implementation
- 3D visualization
- Mobile AR development

---

## 🎯 Quick Links

- 🌐 [AI Studio App](https://ai.studio/apps/drive/1u-bmi5WO_xY9_YwxHN13bi1Vsu2bgY38)
- 📧 Contact: [Create an issue](https://github.com/Blackmvmba88/CIrcuitssss/issues)
- 🐍 BlackMamba Universe: *(Add your links here)*

---

<div align="center">

**Built with ⚡ by makers, for makers**

*From digital dreams to physical reality*

</div>
