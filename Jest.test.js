function multiplySomeNums(x, y, z) {
    return x * y * z;
};

test('multiplySomeNums returns accurate math', function (x, y, z) {
    expect(multiplySomeNums(1,2,3)).toBe(6);
    expect(multiplySomeNums(-1, 3, 2)).toBe(6);
});



