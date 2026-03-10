'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { estimateTokens, formatTokens } from '@/lib/utils/tokens';
import type { Prompt } from '@/lib/types/database';

interface CreateSections {
  contexto: string;
  rol: string;
  ejemplos: { input: string; output: string }[];
  accion: string;
  tono: string;
  tonoLibre: string;
  evaluacion: string;
  evaluacionActiva: boolean;
}

function assemblePrompt(s: CreateSections): string {
  const parts: string[] = [];
  if (s.contexto) parts.push(`**Contexto:** ${s.contexto}`);
  if (s.rol) parts.push(`**Rol:** ${s.rol}`);
  if (s.ejemplos.length > 0) {
    const exStr = s.ejemplos
      .filter((e) => e.input || e.output)
      .map((e, i) => `  Ejemplo ${i + 1}:\n  Entrada: ${e.input}\n  Salida: ${e.output}`)
      .join('\n\n');
    if (exStr) parts.push(`**Ejemplos:**\n${exStr}`);
  }
  if (s.accion) parts.push(`**Acción:** ${s.accion}`);
  const tonoText = [s.tono, s.tonoLibre].filter(Boolean).join('. ');
  if (tonoText) parts.push(`**Tono/Estilo:** ${tonoText}`);
  if (s.evaluacionActiva && s.evaluacion) parts.push(`**Evaluación:** ${s.evaluacion}`);
  else if (s.evaluacionActiva) parts.push('**Evaluación:** Revisa tu respuesta antes de finalizar y verifica que sea correcta y completa.');
  return parts.join('\n\n');
}

export default function ImprovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<CreateSections>({
    contexto: '',
    rol: '',
    ejemplos: [{ input: '', output: '' }],
    accion: '',
    tono: '',
    tonoLibre: '',
    evaluacion: '',
    evaluacionActiva: true,
  });

  const fetchPrompt = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/prompts/${id}`);
      setPrompt(res.data);
    } catch {
      toast('Error al cargar', 'error');
    }
  }, [id, apiFetch, toast]);

  useEffect(() => { fetchPrompt(); }, [fetchPrompt]);

  const assembled = assemblePrompt(sections);
  const tokens = estimateTokens(assembled);

  const updateSection = <K extends keyof CreateSections>(key: K, value: CreateSections[K]) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const addExample = () => updateSection('ejemplos', [...sections.ejemplos, { input: '', output: '' }]);

  const removeExample = (idx: number) => {
    updateSection('ejemplos', sections.ejemplos.filter((_, i) => i !== idx));
  };

  const updateExample = (idx: number, field: 'input' | 'output', value: string) => {
    const updated = [...sections.ejemplos];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSection('ejemplos', updated);
  };

  const handleSave = async () => {
    if (!assembled.trim()) {
      toast('El prompt no puede estar vacío', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/prompts/${id}/improve`, {
        method: 'POST',
        body: JSON.stringify({ content: assembled, note: 'Mejorado con CREATE' }),
      });
      toast('Versión mejorada guardada', 'success');
      router.push(`/prompts/${id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Mejorar prompt con CREATE"
        actions={
          <div className="flex gap-2">
            <Button loading={saving} onClick={handleSave}>Guardar versión mejorada</Button>
            <Button variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {/* Left: CREATE sections */}
        <div className="space-y-5">
          <p className="text-sm text-zinc-500">
            Estructura el prompt en Contexto, Rol, Ejemplos, Acción, Tono y Evaluación.
          </p>

          <Section title="Contexto" description="Describe el proyecto, dominio y restricciones.">
            <textarea
              className="textarea-base"
              rows={3}
              placeholder="Ej.: Estás ayudando a un equipo de desarrollo..."
              value={sections.contexto}
              onChange={(e) => updateSection('contexto', e.target.value)}
            />
          </Section>

          <Section title="Rol de la IA" description="Define quién debe ser la IA.">
            <textarea
              className="textarea-base"
              rows={2}
              placeholder="Ej.: Actúa como arquitecto de software senior..."
              value={sections.rol}
              onChange={(e) => updateSection('rol', e.target.value)}
            />
          </Section>

          <Section title="Ejemplos (input → output)" description="Añade ejemplos de entrada y salida.">
            <div className="space-y-3">
              {sections.ejemplos.map((ex, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">Ejemplo {idx + 1}</span>
                    {sections.ejemplos.length > 1 && (
                      <button onClick={() => removeExample(idx)} className="text-xs text-red-500 hover:underline">
                        Eliminar
                      </button>
                    )}
                  </div>
                  <textarea
                    className="textarea-base mb-2"
                    rows={2}
                    placeholder="Entrada de ejemplo"
                    value={ex.input}
                    onChange={(e) => updateExample(idx, 'input', e.target.value)}
                  />
                  <textarea
                    className="textarea-base"
                    rows={2}
                    placeholder="Salida esperada"
                    value={ex.output}
                    onChange={(e) => updateExample(idx, 'output', e.target.value)}
                  />
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addExample}>+ Añadir ejemplo</Button>
            </div>
          </Section>

          <Section title="Acción" description="Especifica la tarea principal.">
            <textarea
              className="textarea-base"
              rows={2}
              placeholder="Ej.: Diseña un esquema de base de datos..."
              value={sections.accion}
              onChange={(e) => updateSection('accion', e.target.value)}
            />
          </Section>

          <Section title="Tono y estilo" description="Define tono y formato.">
            <Select
              options={[
                { value: '', label: 'Seleccionar tono' },
                { value: 'Profesional', label: 'Profesional' },
                { value: 'Casual', label: 'Casual' },
                { value: 'Técnico', label: 'Técnico' },
                { value: 'Didáctico', label: 'Didáctico' },
              ]}
              value={sections.tono}
              onChange={(e) => updateSection('tono', e.target.value)}
            />
            <textarea
              className="textarea-base mt-2"
              rows={2}
              placeholder="Ej.: Responde en markdown, con secciones..."
              value={sections.tonoLibre}
              onChange={(e) => updateSection('tonoLibre', e.target.value)}
            />
          </Section>

          <Section title="Evaluación" description="Pide a la IA que revise su respuesta.">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sections.evaluacionActiva}
                onChange={(e) => updateSection('evaluacionActiva', e.target.checked)}
                className="rounded"
              />
              Pedir revisión automática
            </label>
            {sections.evaluacionActiva && (
              <textarea
                className="textarea-base mt-2"
                rows={2}
                placeholder="Ej.: Verifica que no falten tablas importantes..."
                value={sections.evaluacion}
                onChange={(e) => updateSection('evaluacion', e.target.value)}
              />
            )}
          </Section>
        </div>

        {/* Right: Preview + Metrics */}
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-500">Vista previa del prompt</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(assembled);
                  toast('Copiado', 'success');
                }}
              >
                Copiar
              </Button>
            </div>
            <pre className="min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
              {assembled || 'El prompt aparecerá aquí conforme rellenes las secciones...'}
            </pre>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Tokens y coste estimado</h2>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatTokens(tokens)}</p>
          </div>

          {prompt && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-medium text-zinc-500">Eficiencia actual</h2>
              <div className="space-y-2 text-sm">
                <p>Iteraciones medias: {Number(prompt.avg_iterations).toFixed(1)}</p>
                <p>Sesiones: {prompt.total_sessions}</p>
              </div>
              <p className="mt-4 text-xs text-zinc-400">
                Un prompt más claro puede aumentar tokens de entrada pero reducir el coste efectivo si disminuye las repreguntas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mb-3 text-xs text-zinc-500">{description}</p>
      {children}
    </div>
  );
}
