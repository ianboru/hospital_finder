import React from 'react';
import { useDefinitionContext } from '../context/AppContext';
import './DefinitionInfoPopUp.css';

// Memoized component that only re-renders when shownDefinition or dataDictionary changes
const DefinitionInfoPopUp = React.memo(() => {
    const { shownDefinition, dataDictionary, setShownDefinition } = useDefinitionContext();

    console.log('[DefinitionInfoPopUp] RENDERING', { shownDefinition });

    // Normalize the key to lowercase for case-insensitive lookup
    const normalizedKey = shownDefinition ? shownDefinition.toLowerCase() : null;
    const dictionaryEntry = normalizedKey ? dataDictionary[normalizedKey] : null;

    if (!shownDefinition || !dictionaryEntry) {
        return null;
    }

    return (
        <div
            className="definition-modal-backdrop"
            onClick={() => setShownDefinition(null)}
        >
            <div
                className="definition-info-popup"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="definition-popup-header">
                    <h3>{dictionaryEntry.term}</h3>
                    <button
                        className="definition-close-button"
                        onClick={() => setShownDefinition(null)}
                    >
                        ×
                    </button>
                </div>
                <div className="definition-popup-content">
                    {dictionaryEntry.definition}
                </div>
            </div>
        </div>
    );
});

DefinitionInfoPopUp.displayName = 'DefinitionInfoPopUp';

export default DefinitionInfoPopUp;
