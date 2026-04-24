"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GlobeIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  SettingsIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Template {
  id: string;
  name: string;
  format: string;
  language: string;
  sections: { [key: string]: string };
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

const DEFAULT_SECTIONS: { [key: string]: { [lang: string]: string } } = {
  feat: {
    en: "Features",
    tr: "Özellikler",
    de: "Funktionen",
    es: "Características",
    fr: "Fonctionnalités",
    pt: "Recursos",
    ja: "新機能",
    zh: "新功能",
    ko: "새 기능",
    ru: "Функции",
  },
  fix: {
    en: "Bug Fixes",
    tr: "Hata Düzeltmeleri",
    de: "Fehlerbehebungen",
    es: "Correcciones",
    fr: "Corrections",
    pt: "Correções",
    ja: "バグ修正",
    zh: "错误修复",
    ko: "버그 수정",
    ru: "Исправления",
  },
  docs: {
    en: "Documentation",
    tr: "Dokümantasyon",
    de: "Dokumentation",
    es: "Documentación",
    fr: "Documentation",
    pt: "Documentação",
    ja: "ドキュメント",
    zh: "文档",
    ko: "문서",
    ru: "Документация",
  },
  refactor: {
    en: "Refactoring",
    tr: "Yeniden Düzenleme",
    de: "Refactoring",
    es: "Refactorización",
    refatoring: "Refactorisation",
    pt: "Refatoração",
    ja: "リファクタリング",
    zh: "重构",
    ko: "리팩토링",
    ru: "Рефакторинг",
  },
  perf: {
    en: "Performance",
    tr: "Performans",
    de: "Leistung",
    es: "Rendimiento",
    fr: "Performance",
    pt: "Desempenho",
    ja: "パフォーマンス",
    zh: "性能",
    ko: "성능",
    ru: "Производительность",
  },
  test: {
    en: "Tests",
    tr: "Testler",
    de: "Tests",
    es: "Pruebas",
    fr: "Tests",
    pt: "Testes",
    ja: "テスト",
    zh: "测试",
    ko: "테스트",
    ru: "Тесты",
  },
};

export default function LanguagePage() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [copied, setCopied] = useState(false);

  const translateSections = (lang: string): string => {
    let output = "# Changelog\n\n";
    
    const sections = [
      { key: "feat", icon: "✨" },
      { key: "fix", icon: "🐛" },
      { key: "perf", icon: "⚡️" },
      { key: "refactor", icon: "♻️" },
      { key: "docs", icon: "📝" },
      { key: "test", icon: "✅" },
    ];

    output += "## [Unreleased] - " + new Date().toISOString().split("T")[0] + "\n\n";

    for (const section of sections) {
      const label = DEFAULT_SECTIONS[section.key]?.[lang] || DEFAULT_SECTIONS[section.key]?.en || section.key;
      output += `### ${section.icon} ${label}\n\n`;
      output += `- Sample commit with scope (abc1234)\n`;
      output += `- Another commit (def5678)\n\n`;
    }

    output += "---\n";
    output += `Generated with ReleaseFlow | [${LANGUAGES.find(l => l.code === lang)?.name}]`;

    return output;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(translateSections(selectedLang));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lang = LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-Language Export</h1>
            <p className="text-gray-600">Export changelog in different languages</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => setSelectedLang(language.code)}
              className={`p-4 rounded-lg border text-center transition-colors ${
                selectedLang === language.code
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{language.flag}</span>
              <p className="mt-1 text-sm font-medium">{language.name}</p>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{lang?.flag} {lang?.name} Output</CardTitle>
              <CardDescription>
                Preview of changelog in {lang?.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline">
                {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-[400px] overflow-y-auto whitespace-pre-wrap">
              {translateSections(selectedLang)}
            </pre>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {LANGUAGES.map((language) => (
                <div key={language.code} className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span className="text-sm">{language.name}</span>
                  <span className="text-xs text-gray-400">({language.code})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}