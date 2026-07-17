import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Save } from "lucide-react";
import { Template } from "../mockData";

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Omit<Template, "id" | "lastUsed" | "lastUsedTimestamp" | "createdTimestamp" | "timesUsed" | "isFavorite"> & { id?: string }) => void;
  template: Template | null; // Null if creating new
}

const categories = [
  "DevOps",
  "Docker",
  "Kubernetes",
  "AWS",
  "Linux",
  "Networking",
  "Database",
  "Monitoring",
  "Security"
];

export default function TemplateFormModal({ isOpen, onClose, onSave, template }: TemplateFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DevOps");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [estimatedTime, setEstimatedTime] = useState("10 mins");
  const [variablesText, setVariablesText] = useState("");
  const [stepsText, setStepsText] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or pre-fill form when template changes or modal opens
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setDifficulty(template.difficulty);
      setEstimatedTime(template.estimatedTime);
      setVariablesText(template.variables.join(", "));
      setStepsText(template.steps.join("\n"));
    } else {
      setName("");
      setDescription("");
      setCategory("DevOps");
      setDifficulty("Easy");
      setEstimatedTime("10 mins");
      setVariablesText("");
      setStepsText("");
    }
    setErrors({});
  }, [template, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Template name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!estimatedTime.trim()) newErrors.estimatedTime = "Estimated time is required";
    if (!stepsText.trim()) newErrors.stepsText = "Workflow steps are required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Parse variables and steps
    const variables = variablesText
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave({
      id: template?.id,
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      variables,
      steps
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          />

          {/* Modal Wrapper */}
          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 z-[101]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl bg-sidebar-bg/95 backdrop-blur-xl border border-box-border/95 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-box-border/80 flex items-center justify-between select-none">
                <h3 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent-primary" />
                  {template ? "Edit SOP Template" : "Create SOP Template"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-text-muted hover:text-foreground hover:bg-box-bg/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                    Template Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Deploy Kubernetes Patch"
                    className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-box-bg/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors"
                  />
                  {errors.name && <span className="text-[11px] text-rose-400 font-mono">{errors.name}</span>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Reusable deployment workflow to patch configurations in live clusters."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-box-bg/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors resize-none"
                  />
                  {errors.description && <span className="text-[11px] text-rose-400 font-mono">{errors.description}</span>}
                </div>

                {/* Metadata group */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-sidebar-bg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <label htmlFor="difficulty" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                      className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-sidebar-bg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  {/* Estimated Time */}
                  <div className="space-y-1.5">
                    <label htmlFor="estTime" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                      Est. Time
                    </label>
                    <input
                      type="text"
                      id="estTime"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 15 mins"
                      className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-box-bg/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors"
                    />
                    {errors.estimatedTime && <span className="text-[11px] text-rose-400 font-mono">{errors.estimatedTime}</span>}
                  </div>
                </div>

                {/* Variables */}
                <div className="space-y-1.5">
                  <label htmlFor="variables" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider flex items-center justify-between">
                    <span>Variables</span>
                    <span className="text-[10px] text-text-muted font-normal uppercase tracking-normal">Comma Separated</span>
                  </label>
                  <input
                    type="text"
                    id="variables"
                    value={variablesText}
                    onChange={(e) => setVariablesText(e.target.value)}
                    placeholder="e.g. namespace, deployment_name, pod_limit"
                    className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-box-bg/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors"
                  />
                </div>

                {/* Steps */}
                <div className="space-y-1.5">
                  <label htmlFor="steps" className="text-xs font-bold text-foreground font-mono uppercase tracking-wider flex items-center justify-between">
                    <span>Workflow Steps</span>
                    <span className="text-[10px] text-text-muted font-normal uppercase tracking-normal">One step per line</span>
                  </label>
                  <textarea
                    id="steps"
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    placeholder="Verify pod logs&#10;Describe pod deployment&#10;Apply patches spec specs"
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-box-border bg-box-bg/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/50 transition-colors resize-y font-sans"
                  />
                  {errors.stepsText && <span className="text-[11px] text-rose-400 font-mono">{errors.stepsText}</span>}
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-box-border bg-box-bg/10 flex justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-box-border bg-box-bg/35 text-text-muted hover:text-foreground hover:bg-box-bg/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-accent-primary text-slate-950 hover:bg-accent-primary/95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 fill-none text-slate-950" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
