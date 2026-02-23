"use client";

import { IconTrashFilled } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExamplePairProps {
  index: number;
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  onOutputChange: (value: string) => void;
  onRemove: () => void;
}

export function ExamplePair({
  index,
  input,
  output,
  onInputChange,
  onOutputChange,
  onRemove,
}: ExamplePairProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary">
          Example {index + 1}
        </span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-text-secondary hover:text-error">
          <IconTrashFilled size={14} />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>User input</Label>
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="What the user says..."
            rows={2}
            className="text-sm"
          />
        </div>
        <div>
          <Label>Claude response</Label>
          <Textarea
            value={output}
            onChange={(e) => onOutputChange(e.target.value)}
            placeholder="How Claude should respond..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </Card>
  );
}
