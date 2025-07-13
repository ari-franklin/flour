import { useState, useEffect } from 'react';
import { Check, ChevronDown, Target } from 'lucide-react';

export interface OutcomeOption {
  id: string;
  title: string;
  team_id: string;
}

export interface ObjectiveFormData {
  name: string;
  target: string;
  direction: 'increase' | 'decrease';
  outcome_id?: string;
}

interface ObjectiveFormProps {
  onSubmit: (data: ObjectiveFormData) => void;
  initialData?: Partial<ObjectiveFormData>;
  isLoading?: boolean;
  outcomes?: OutcomeOption[];
}

export function ObjectiveForm({ 
  onSubmit, 
  initialData, 
  isLoading = false, 
  outcomes = [] 
}: ObjectiveFormProps) {
  const [formData, setFormData] = useState<Omit<ObjectiveFormData, 'direction' | 'outcome_id'>>({
    name: initialData?.name || '',
    target: initialData?.target || '',
  });
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(initialData?.outcome_id || '');
  const [showOutcomeDropdown, setShowOutcomeDropdown] = useState(false);
  
  const [direction, setDirection] = useState<'increase' | 'decrease'>(initialData?.direction || 'increase');
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: ObjectiveFormData = {
      ...formData,
      direction,
    };
    
    // Only include outcome_id if one is selected
    if (selectedOutcomeId) {
      submitData.outcome_id = selectedOutcomeId;
    }
    
    onSubmit(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDirection = (newDirection: 'increase' | 'decrease') => {
    setDirection(newDirection);
    setShowDirectionDropdown(false);
  };

  // Auto-parse the direction based on the first word
  useEffect(() => {
    const firstWord = formData.name.split(' ')[0]?.toLowerCase();
    const increaseTerms = ['increase', 'grow', 'boost', 'raise', 'improve'];
    const decreaseTerms = ['decrease', 'reduce', 'lower', 'cut', 'minimize'];

    if (increaseTerms.some(term => firstWord?.includes(term))) {
      setDirection('increase');
    } else if (decreaseTerms.some(term => firstWord?.includes(term))) {
      setDirection('decrease');
    }
  }, [formData.name]);

  const directionOptions = [
    { value: 'increase', label: 'Increase', description: 'Goal is to go up (e.g., revenue, users)' },
    { value: 'decrease', label: 'Decrease', description: 'Goal is to go down (e.g., churn, costs)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Objective
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g., Increase revenue to $50M"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Start with a verb (increase, reduce, maintain, etc.)
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="target" className="block text-sm font-medium text-gray-700">
          Quantified Success Goal
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            name="target"
            id="target"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. $50M, 10%, 1M users"
            value={formData.target}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link to Product Outcome (Optional)
        </label>
        <div className="relative">
          <button
            type="button"
            className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onClick={() => setShowOutcomeDropdown(!showOutcomeDropdown)}
          >
            {selectedOutcomeId ? (
              <span className="flex items-center">
                <Target className="h-4 w-4 text-indigo-600 mr-2" />
                {outcomes.find(o => o.id === selectedOutcomeId)?.title || 'Select an outcome'}
              </span>
            ) : (
              <span className="text-gray-500">Select an outcome</span>
            )}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </span>
          </button>

          {showOutcomeDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {outcomes.length > 0 ? (
                outcomes.map((outcome) => (
                  <div
                    key={outcome.id}
                    className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${selectedOutcomeId === outcome.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => {
                      setSelectedOutcomeId(outcome.id);
                      setShowOutcomeDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-indigo-600 mr-2" />
                      <span className="font-normal block truncate">
                        {outcome.title}
                      </span>
                    </div>
                    {selectedOutcomeId === outcome.id && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 py-2 pl-3 pr-9 text-sm">
                  No outcomes available
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Link this business objective to an existing product outcome
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Direction
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDirectionDropdown(!showDirectionDropdown)}
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex items-center justify-between"
          >
            <span className="flex items-center">
              <span className="block truncate">
                {direction === 'increase' ? 'Increase' : 'Decrease'}
              </span>
            </span>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>

          {showDirectionDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {directionOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => toggleDirection(option.value as 'increase' | 'decrease')}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                >
                  <div className="flex items-center">
                    <span className="font-normal block truncate">
                      {option.label}
                    </span>
                  </div>
                  {direction === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                      <Check className="h-5 w-5" />
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.target}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Objective'}
        </button>
      </div>
    </form>
  );
}
