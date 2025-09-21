"use client";

import { useState } from 'react';
import { getSecurityTips } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function SecurityTipsGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ advisories?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const response = await getSecurityTips(topic);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="space-y-4 text-left">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej: seguridad en el hogar, seguridad en línea..."
          className="flex-grow bg-background/80"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generar Consejos'}
        </Button>
      </form>

      {result && (
        <Card className="mt-4">
          <CardContent className="p-6">
            {result.error && <p className="text-destructive">{result.error}</p>}
            {result.advisories && (
              <div className="space-y-2 text-sm text-foreground/90">
                {result.advisories.split('\n').map((line, index) => (
                  line.trim() && <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
