"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
import { mockTemplates, Template } from "./mockData";

// Components
import Header from "./components/Header";
import RecentTemplates from "./components/RecentTemplates";
import SearchBar from "./components/SearchBar";
import CategoryFilters from "./components/CategoryFilters";
import SortDropdown, { SortOption } from "./components/SortDropdown";
import TemplateGrid from "./components/TemplateGrid";
import PreviewDrawer from "./components/PreviewDrawer";
import EmptyState from "./components/EmptyState";
import DeleteDialog from "./components/DeleteDialog";
import TemplateFormModal from "./components/TemplateFormModal";

const LOCAL_STORAGE_KEY = "context_sop_templates";

export default function TemplateLibrary() {
  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recently-used");

  // Dialog/Drawer States
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);
  const [formTemplate, setFormTemplate] = useState<Template | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize templates state from localStorage or mockData
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates from localStorage", e);
        setTemplates(mockTemplates);
      }
    } else {
      setTemplates(mockTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockTemplates));
    }
  }, []);

  // Save templates helper
  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
  };

  // Show toast helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers
  const handleToggleFavorite = (targetTemplate: Template) => {
    const updated = templates.map((t) =>
      t.id === targetTemplate.id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    saveTemplates(updated);
    showToast(
      targetTemplate.isFavorite
        ? `Removed "${targetTemplate.name}" from favorites`
        : `Added "${targetTemplate.name}" to favorites`
    );
  };

  const handleDuplicate = (targetTemplate: Template) => {
    const copyName = `${targetTemplate.name} Copy`;
    const newTemplate: Template = {
      ...targetTemplate,
      id: Date.now().toString(),
      name: copyName,
      isFavorite: false,
      timesUsed: 0,
      lastUsed: "Never",
      lastUsedTimestamp: 0,
      createdTimestamp: Date.now()
    };

    saveTemplates([newTemplate, ...templates]);
    showToast(`Duplicated "${targetTemplate.name}"`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTemplate) return;
    const updated = templates.filter((t) => t.id !== deleteTemplate.id);
    saveTemplates(updated);
    showToast(`Deleted "${deleteTemplate.name}"`);
    setDeleteTemplate(null);
    if (previewTemplate?.id === deleteTemplate.id) {
      setPreviewTemplate(null);
    }
  };

  const handleSaveTemplate = (formData: Omit<Template, "id" | "lastUsed" | "lastUsedTimestamp" | "createdTimestamp" | "timesUsed" | "isFavorite"> & { id?: string }) => {
    if (formData.id) {
      // Edit mode
      const updated = templates.map((t) => {
        if (t.id === formData.id) {
          return {
            ...t,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            difficulty: formData.difficulty,
            estimatedTime: formData.estimatedTime,
            variables: formData.variables,
            steps: formData.steps
          };
        }
        return t;
      });
      saveTemplates(updated);
      showToast(`Updated "${formData.name}" successfully`);
      
      // Update preview if active
      if (previewTemplate?.id === formData.id) {
        const updatedPreview = updated.find((t) => t.id === formData.id);
        if (updatedPreview) setPreviewTemplate(updatedPreview);
      }
    } else {
      // Create mode
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime,
        variables: formData.variables,
        steps: formData.steps,
        lastUsed: "Never",
        lastUsedTimestamp: 0,
        createdTimestamp: Date.now(),
        timesUsed: 0,
        isFavorite: false
      };
      saveTemplates([newTemplate, ...templates]);
      showToast(`Created "${formData.name}" successfully`);
    }

    setIsFormOpen(false);
    setFormTemplate(null);
  };

  const handleUseTemplate = (targetTemplate: Template) => {
    const updated = templates.map((t) =>
      t.id === targetTemplate.id
        ? {
            ...t,
            timesUsed: t.timesUsed + 1,
            lastUsed: "Just now",
            lastUsedTimestamp: Date.now()
          }
        : t
    );
    saveTemplates(updated);
    showToast(`Instantiated workflow for "${targetTemplate.name}"!`);
    setPreviewTemplate(null);
  };

  // Filter & Sort Logic
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(t.category);

    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "recently-used":
        return b.lastUsedTimestamp - a.lastUsedTimestamp;
      case "recently-created":
        return b.createdTimestamp - a.createdTimestamp;
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "most-used":
        return b.timesUsed - a.timesUsed;
      case "favorites":
        // true values first
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      default:
        return 0;
    }
  });

  // Extract favorite templates
  const favoriteTemplates = sortedTemplates.filter((t) => t.isFavorite);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header component */}
      <Header onNewTemplate={() => {
        setFormTemplate(null);
        setIsFormOpen(true);
      }} />

      {/* Recent / Horizontal list */}
      <RecentTemplates
        templates={templates}
        onSelect={(t) => setPreviewTemplate(t)}
      />

      {/* Toolbar / Search, Filter, Sort */}
      <div className="flex flex-col gap-4 bg-box-bg/15 border border-box-border/80 rounded-2xl p-5 shadow-sm">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1 border-t border-sidebar-border/30">
          <CategoryFilters
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />
          <div className="shrink-0 self-start sm:self-center">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {sortedTemplates.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          selectedCategories={selectedCategories}
          onCreateTemplate={() => {
            setFormTemplate(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="space-y-10">
          {/* Favorites Section (appears above others if present) */}
          {favoriteTemplates.length > 0 && (
            <section className="space-y-4 animate-fadeIn">
              <h2 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Favorite Templates ({favoriteTemplates.length})
              </h2>
              <TemplateGrid
                templates={favoriteTemplates}
                onPreview={(t) => setPreviewTemplate(t)}
                onUse={handleUseTemplate}
                onEdit={(t) => {
                  setFormTemplate(t);
                  setIsFormOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onDelete={(t) => setDeleteTemplate(t)}
                onToggleFavorite={handleToggleFavorite}
              />
            </section>
          )}

          {/* All Templates Grid */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-text-muted font-mono uppercase tracking-wider select-none">
              All Reusable Workflows ({sortedTemplates.length})
            </h2>
            <TemplateGrid
              templates={sortedTemplates}
              onPreview={(t) => setPreviewTemplate(t)}
              onUse={handleUseTemplate}
              onEdit={(t) => {
                setFormTemplate(t);
                setIsFormOpen(true);
              }}
              onDuplicate={handleDuplicate}
              onDelete={(t) => setDeleteTemplate(t)}
              onToggleFavorite={handleToggleFavorite}
            />
          </section>
        </div>
      )}

      {/* Slide-out Drawer Preview */}
      <PreviewDrawer
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteTemplate !== null}
        onClose={() => setDeleteTemplate(null)}
        onConfirm={handleDeleteConfirm}
        templateName={deleteTemplate?.name || ""}
      />

      {/* Edit/Create Form Modal */}
      <TemplateFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={formTemplate}
      />

      {/* Animated Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[1000] flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-2xl backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
