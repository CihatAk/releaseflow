"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, SaveIcon, CopyIcon, CheckIcon, RotateCcwIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Template {
  id: string;
  name: string;
  format: string;
  isDefault?: boolean;
}

const defaultTemplates: Template[] = [
  {
    id: "default",
    name: "Default",
    format: "# Changelog\n\n## [Unreleased]\n\n### Features\n- item\n\n### Bug Fixes\n- item\n",
    isDefault: true,
  },
  {
    id: "keepachangelog",
    name: "Keep a Changelog",
    format: "# Changelog\n\n## [Version] - Date\n\n### Added\n- item\n",
  },
  {
    id: "simple",
    name: "Simple",
    format: "# Changes\n- item\n",
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditingTemplate({ ...template });
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUseTemplate = (template: Template) => {
    localStorage.setItem("rf_selected_template", template.id);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Format Templates</h1>
          <p className="text-muted-foreground">Create custom changelog formats</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleSelectTemplate(template)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {template.name}
                  {template.isDefault && <span className="text-xs bg-muted px-2 py-0.5 rounded">Default</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground overflow-hidden truncate">{template.format}</pre>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingTemplate && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Template Name</label>
                <Input value={editingTemplate.name} onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} disabled={editingTemplate.isDefault} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Format Template</label>
                <textarea value={editingTemplate.format} onChange={(e) => setEditingTemplate({ ...editingTemplate, format: e.target.value })} disabled={editingTemplate.isDefault} className="h-48 w-full rounded-lg border border-input bg-background p-4 font-mono text-sm" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={editingTemplate.isDefault}>
                  {saved ? <><CheckIcon className="h-4 w-4" /> Saved!</> : <><SaveIcon className="h-4 w-4" /> Save</>}
                </Button>
                <Button variant="outline" onClick={() => handleUseTemplate(editingTemplate)}>
                  <RotateCcwIcon className="h-4 w-4" /> Use
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}