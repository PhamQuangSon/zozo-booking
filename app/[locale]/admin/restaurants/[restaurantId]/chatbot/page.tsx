"use client";

import { useEffect, useState, use } from "react";
import { getChatbotConfig, updateChatbotConfig, type ChatbotConfigData } from "@/actions/chatbot-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ChatbotAdminPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = use(params);
  const restaurantId = Number(resolvedParams.restaurantId);
  const { toast } = useToast();
  
  const [config, setConfig] = useState<ChatbotConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const res = await getChatbotConfig(restaurantId);
      if (res.success && res.data) {
        setConfig(res.data);
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
      setIsLoading(false);
    }
    loadConfig();
  }, [restaurantId, toast]);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    const res = await updateChatbotConfig(restaurantId, config);
    setIsSaving(false);
    
    if (res.success) {
      toast({ title: "Success", description: "Chatbot configuration saved successfully." });
    } else {
      toast({ title: "Error", description: res.error || "Failed to save configuration.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading configuration...</div>;
  }

  if (!config) {
    return <div className="p-8 text-red-500">Failed to load configuration.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Chatbot Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure how the AI menu assistant behaves for your restaurant.
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-lg border">
        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-base">Enable Chatbot</Label>
            <p className="text-sm text-muted-foreground">
              Turn the AI assistant on or off for your customers.
            </p>
          </div>
          <Switch 
            id="isActive"
            checked={config.isActive} 
            onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })} 
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">AI Model</Label>
          <Select 
            value={config.modelName} 
            onValueChange={(val) => setConfig({ ...config, modelName: val })}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">OpenAI: GPT-4o Mini (Fast & Cheap)</SelectItem>
              <SelectItem value="gpt-4o">OpenAI: GPT-4o (Smart)</SelectItem>
              <SelectItem value="gemini-2.5-flash">Google: Gemini 2.5 Flash</SelectItem>
              <SelectItem value="gemini-2.5-pro">Google: Gemini 2.5 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Creativity (Temperature: {config.temperature})</Label>
            <span className="text-sm text-muted-foreground">
              {config.temperature < 0.5 ? 'Strict & Factual' : config.temperature > 0.8 ? 'Creative & Flexible' : 'Balanced'}
            </span>
          </div>
          <Slider 
            value={[config.temperature]} 
            min={0} max={1} step={0.1}
            onValueChange={([val]) => setConfig({ ...config, temperature: val })}
          />
        </div>

        {/* Max Messages Per Session */}
        <div className="space-y-2">
          <Label htmlFor="maxMessages">Max Messages Per Session (Anti-Spam)</Label>
          <Input 
            id="maxMessages" 
            type="number" 
            min={1} 
            max={100}
            value={config.maxMessages}
            onChange={(e) => setConfig({ ...config, maxMessages: Number.parseInt(e.target.value) || 20 })}
          />
          <p className="text-sm text-muted-foreground">
            Limit the number of messages a user can send in a single chat session to prevent abuse.
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">System Prompt</Label>
          <Textarea 
            id="prompt" 
            className="min-h-[200px] font-mono text-sm"
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            placeholder="You are a helpful assistant..."
          />
          <p className="text-sm text-muted-foreground">
            This prompt defines how the AI behaves. The current menu items will be automatically appended to the prompt.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
