import React from 'react';
import { useDefinitionContext } from '../context/AppContext';

// Memoized component that only re-renders when shownDefinition or dataDictionary changes
const DefinitionInfoPopUp = React.memo(() => {
    const { shownDefinition, dataDictionary } = useDefinitionContext();

    console.log('[DefinitionInfoPopUp] RENDERING', { shownDefinition });

    if (!shownDefinition || !dataDictionary[shownDefinition]) {
        return null;
    }

    return (
        <div className="definition-info-popup">
            <h3>{dataDictionary[shownDefinition].term}</h3>
            <div>{dataDictionary[shownDefinition].definition}</div>
        </div>
    );
});

DefinitionInfoPopUp.displayName = 'DefinitionInfoPopUp';

export default DefinitionInfoPopUp;
