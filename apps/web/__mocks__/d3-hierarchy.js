// Mock d3-hierarchy for Jest tests
export const hierarchy = jest.fn(() => ({
    descendants: jest.fn(() => []),
    links: jest.fn(() => []),
    each: jest.fn(),
    sum: jest.fn(),
    sort: jest.fn(),
}));

export const tree = jest.fn(() => ({
    size: jest.fn().mockReturnThis(),
    separation: jest.fn().mockReturnThis(),
    nodeSize: jest.fn().mockReturnThis(),
}));

export const cluster = jest.fn(() => ({
    size: jest.fn().mockReturnThis(),
    separation: jest.fn().mockReturnThis(),
    nodeSize: jest.fn().mockReturnThis(),
}));

export const partition = jest.fn(() => ({
    size: jest.fn().mockReturnThis(),
    round: jest.fn().mockReturnThis(),
    padding: jest.fn().mockReturnThis(),
}));

export const pack = jest.fn(() => ({
    size: jest.fn().mockReturnThis(),
    radius: jest.fn().mockReturnThis(),
    padding: jest.fn().mockReturnThis(),
}));

export const treemap = jest.fn(() => ({
    size: jest.fn().mockReturnThis(),
    round: jest.fn().mockReturnThis(),
    padding: jest.fn().mockReturnThis(),
    paddingInner: jest.fn().mockReturnThis(),
    paddingOuter: jest.fn().mockReturnThis(),
    paddingTop: jest.fn().mockReturnThis(),
    paddingRight: jest.fn().mkReturnThis(),
    paddingBottom: jest.fn().mockReturnThis(),
    paddingLeft: jest.fn().mockReturnThis(),
    tile: jest.fn().mockReturnThis(),
}));

export const stratify = jest.fn(() => ({
    id: jest.fn().mockReturnThis(),
    parentId: jest.fn().mockReturnThis(),
}));