import { useState } from 'react';

export type PlayerConfig = {
    model: string;
    type: 'chat' | 'completion';
  };
  
export type PlayerConfigProps = {
  player: PlayerConfig;
  setPlayer: (config: PlayerConfig) => void;
  models: Model[];
  playerColor: string;
};

export function PlayerConfig({ player, setPlayer, models, playerColor }: PlayerConfigProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Group models by model class
  const groupedModels = models.reduce((acc, model) => {
    const key = model.model_class.replace(/-?\d+$/, '').trim(); // Remove version numbers
    if (!acc[key]) acc[key] = [];
    acc[key].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  // Filter models based on search query
  const filteredGroups = Object.entries(groupedModels).reduce((acc, [groupName, groupModels]) => {
    const filtered = groupModels.filter(model =>
      model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.model_class.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[groupName] = filtered;
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <div className="relative">
      <h4 className="text-sm font-medium mb-2">{playerColor} Player</h4>
      <div className="relative">
      <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border rounded-md mb-2 text-sm bg-white dark:bg-gray-700 flex justify-between items-center text-gray-900 dark:text-gray-100"
        >
          <span className="truncate">
            {models.find(m => m.id === player.model)?.id || 'Select a model'}
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2 sticky top-0 bg-white">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded mb-2"
              />
              {models.length === 0 && (
                <div className="text-center py-2">
                  <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto" viewBox="0 0 24 24">
                    {/* spinner SVG */}
                  </svg>
                </div>
              )}
            </div>
            
            {Object.entries(filteredGroups).map(([groupName, groupModels]) => (
              <div key={groupName}>
                <div className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-500">
                  {groupName}
                </div>
                {groupModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setPlayer({ ...player, model: model.id });
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                      model.id === player.model ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 truncate">
                        <div className="font-medium">
                          {model.id.split('/').pop()}
                          {model.is_gated && (
                            <span className="ml-2 px-1 bg-yellow-100 text-yellow-800 text-xs rounded">Gated</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {model.context_length} ctx · {model.max_completion_tokens} tokens
                        </div>
                      </div>
                      {model.available_on_current_plan && (
                        <span className="ml-2 px-2 bg-green-100 text-green-800 text-xs rounded">Available</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPlayer({ ...player, type: 'chat' })}
          className={`flex-1 px-2 py-1 text-sm rounded ${
            player.type === 'chat' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setPlayer({ ...player, type: 'completion' })}
          className={`flex-1 px-2 py-1 text-sm rounded ${
            player.type === 'completion' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100'
          }`}
        >
          Completion
        </button>
      </div>
    </div>
  );
} 