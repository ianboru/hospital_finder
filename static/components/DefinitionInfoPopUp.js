import React from 'react';
import { useDefinitionContext } from '../context/AppContext';
import './DefinitionInfoPopUp.css';

// Memoized component that only re-renders when shownDefinition or dataDictionary changes
const DefinitionInfoPopUp = React.memo(() => {
    const { shownDefinition, dataDictionary, setShownDefinition } = useDefinitionContext();

    console.log('[DefinitionInfoPopUp] RENDERING', { shownDefinition });

    if (!shownDefinition || !dataDictionary[shownDefinition]) {
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
                    <h3>{dataDictionary[shownDefinition].term}</h3>
                    <button
                        className="definition-close-button"
                        onClick={() => setShownDefinition(null)}
                    >
                        ×
                    </button>
                </div>
                <div className="definition-popup-content">
                    {dataDictionary[shownDefinition].definition}
                </div>
            </div>
        </div>
    );
});

DefinitionInfoPopUp.displayName = 'DefinitionInfoPopUp';

export default DefinitionInfoPopUp;
