type PromptConfigProps = {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  userPromptTemplate: string;
  setUserPromptTemplate: (prompt: string) => void;
}

export function PromptConfig({ 
  systemPrompt, 
  setSystemPrompt, 
  userPromptTemplate, 
  setUserPromptTemplate 
}: PromptConfigProps) {
  return (
    <div className="w-64 bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Prompt Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm h-24 resize-y"
            placeholder="You are a chess master..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">User Prompt Template</label>
          <textarea
            value={userPromptTemplate}
            onChange={(e) => setUserPromptTemplate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm h-24 resize-y"
            placeholder="Given this chess position in FEN notation: {fen}, what would be a good move?"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use fen and pgn as placeholders for the current position
          </p>
        </div>
      </div>
    </div>
  )
} 