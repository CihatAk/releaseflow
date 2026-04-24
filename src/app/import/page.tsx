"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UploadIcon,
  FileTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
  DownloadIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChangelogEntry {
  version: string;
  date?: string;
  changes?: string;
  sections: { [key: string]: string[] };
}

export default function ImportChangelogPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    entries: ChangelogEntry[];
    merged: string;
  } | null>(null);
  const [existingChangelog, setExistingChangelog] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExistingChangelog = (content: string): ChangelogEntry[] => {
    const entries: ChangelogEntry[] = [];
    const lines = content.split("\n");
    
    let currentVersion = "";
    let currentSection = "";
    let currentChanges: string[] = [];
    let sections: { [key: string]: string[] } = {};

    for (const line of lines) {
      const versionMatch = line.match(/^##\s*\[?v?(\d+\.\d+\.\d+)\]?/);
      const sectionMatch = line.match(/^###\s*(\w+)/);
      
      if (versionMatch) {
        if (currentVersion) {
          entries.push({ version: currentVersion, sections });
        }
        currentVersion = versionMatch[1];
        sections = {};
        currentChanges = [];
      } else if (sectionMatch) {
        if (currentChanges.length > 0 && currentSection) {
          sections[currentSection] = currentChanges;
        }
        currentSection = sectionMatch[1];
        currentChanges = [];
      } else if (line.startsWith("- ")) {
        currentChanges.push(line.substring(2));
      }
    }

    if (currentVersion && currentChanges.length > 0 && currentSection) {
      sections[currentSection] = currentChanges;
      entries.push({ version: currentVersion, sections });
    }

    return entries;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const text = await file.text();
    
    const entries = parseExistingChangelog(text);
    setExistingChangelog(text);
    setResult({
      entries,
      merged: text,
    });
    setImporting(false);
  };

  const handleMerge = (newChangelog: string) => {
    const merged = `${newChangelog}\n\n---\n\n${existingChangelog}`;
    setResult({
      ...result!,
      merged,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historical Import</h1>
            <p className="text-gray-600">Import and merge existing CHANGELOG.md files</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Import Existing Changelog
            </CardTitle>
            <CardDescription>
              Upload a CHANGELOG.md file to parse and merge with new changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              accept=".md,.markdown"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {importing ? (
                <Loader2Icon className="w-8 h-8 mx-auto animate-spin text-gray-400" />
              ) : (
                <>
                  <FileTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-4">
                    Click to select a CHANGELOG.md file
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Parsed Entries ({result.entries.length})</CardTitle>
                <CardDescription>
                  Found {result.entries.length} versions in the file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {result.entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-mono font-medium">v{entry.version}</span>
                      <div className="flex-1 flex gap-2 flex-wrap">
                        {Object.keys(entry.sections).map((section) => (
                          <span
                            key={section}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {section}: {entry.sections[section].length} items
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Merge with New Changelog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate new changelog content above and it will be merged with the imported history.
                </p>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-[200px] overflow-y-auto">
                  {result.merged.slice(0, 500)}...
                </div>

                <div className="flex gap-2 mt-4">
                  <Button>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Merged
                  </Button>
                  <Button variant="outline">
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Keep a Changelog</h4>
                <p className="text-sm text-gray-500">Standard format</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Standard Version</h4>
                <p className="text-sm text-gray-500">Conventional commits</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Custom Format</h4>
                <p className="text-sm text-gray-500">Your own style</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}