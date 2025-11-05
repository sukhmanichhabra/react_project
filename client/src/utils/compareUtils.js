// Utility functions for property comparison

export const getCompareList = () => {
    try {
        const list = localStorage.getItem('compareList');
        return list ? JSON.parse(list) : [];
    } catch (error) {
        console.error('Error getting compare list:', error);
        return [];
    }
};

export const addToCompare = (property) => {
    const compareList = getCompareList();
    
    // Check if already in list
    if (compareList.some(p => p.id === property._id)) {
        return { success: false, message: 'Property already in comparison list' };
    }
    
    // Check if list is full
    if (compareList.length >= 4) {
        return { success: false, message: 'You can only compare up to 4 properties' };
    }
    
    // Add to list
    const newItem = {
        id: property._id,
        title: property.title
    };
    
    compareList.push(newItem);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    
    return { success: true, message: 'Property added to comparison', count: compareList.length };
};

export const removeFromCompare = (propertyId) => {
    const compareList = getCompareList();
    const filtered = compareList.filter(p => p.id !== propertyId);
    localStorage.setItem('compareList', JSON.stringify(filtered));
    return { success: true, count: filtered.length };
};

export const clearCompareList = () => {
    localStorage.removeItem('compareList');
    return { success: true, count: 0 };
};

export const isInCompareList = (propertyId) => {
    const compareList = getCompareList();
    return compareList.some(p => p.id === propertyId);
};
