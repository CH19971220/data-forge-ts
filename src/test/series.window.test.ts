import { assert, expect } from 'chai';
import 'mocha';
import { Series, ISeries, Index } from '../index';

describe('Series window', () => {
    
	it('can compute window - creates an empty series from an empty data set', function () {

		var series = new Series();
		var windowed = series.window(2)
        .select(window => {
            throw new Error("This should never be executed.");
        });

		expect(windowed.count()).to.eql(0);
	});

	it('can compute window - with even window size and even number of rows', function () {

        var series = new Series({ index: [10, 20, 30, 40], values: [1, 2, 3, 4] });
		var windowed = series
			.window(2)
            .select(window => [window.getIndex().last(), window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);
            
		expect(windowed.toPairs()).to.eql([
			[20, [1, 2]],
			[40, [3, 4]],
		]);
	});

	it('can compute window - with even window size and odd number of rows', function () {

		var series = new Series({ index: [10, 20, 30, 40, 50], values: [1, 2, 3, 4, 5] });
		var windowed = series
			.window(2)
            .select(window => [window.getIndex().first(), window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toPairs()).to.eql([
			[10, [1, 2]],
			[30, [3, 4]],
			[50, [5]],
		]);
	});

	it('can compute window - with odd window size and odd number of rows', function () {

		var series = new Series({ values: [1, 2, 3, 4, 5, 6] });
		var windowed = series
			.window(3)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toPairs()).to.eql([
			[0, [1, 2, 3]],
			[1, [4, 5, 6]],
		]);

	});

	it('can compute window - with odd window size and even number of rows', function () {

		var series = new Series({ values: [1, 2, 3, 4, 5] });
		var windowed = series
			.window(3)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toPairs()).to.eql([
			[0, [1, 2, 3]],
			[1, [4, 5]],
		]);

	});

    
	it('can compute rolling window - from empty data set', function () {

		var series = new Series();
		var windowed = series
			.rollingWindow(2)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toArray().length).to.eql(0);
	});

	it('rolling window returns 0 values when there are not enough values in the data set', function () {

		var series = new Series({ index: [0, 1], values: [1, 2] });
		var windowed = series
			.rollingWindow(3)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toArray().length).to.eql(0);
	});

	it('can compute rolling window - odd data set with even period', function () {

		var series = new Series({ index: [10, 20, 30, 40, 50], values: [0, 1, 2, 3, 4] });
		var windowed = series
			.rollingWindow(2)
			.select(window => [window.getIndex().last(), window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toPairs()).to.eql([
            [20, [0, 1]],
            [30, [1, 2]],
            [40, [2, 3]],
            [50, [3, 4]],
        ]);
	});

	it('can compute rolling window - odd data set with odd period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4], values: [0, 1, 2, 3, 4] });
		var windowed = series
			.rollingWindow(3)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([0, 1, 2]);

		var values = windowed.toArray();
		expect(values.length).to.eql(3);
		expect(values[0]).to.eql([0, 1, 2]);
		expect(values[1]).to.eql([1, 2, 3]);
		expect(values[2]).to.eql([2, 3, 4]);
	});

	it('can compute rolling window - even data set with even period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(2)
            .select((window, windowIndex) => [windowIndex+10, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([10, 11, 12, 13, 14]);

		var values = windowed.toArray();
		expect(values.length).to.eql(5);
		expect(values[0]).to.eql([0, 1]);
		expect(values[1]).to.eql([1, 2]);
		expect(values[2]).to.eql([2, 3]);
		expect(values[3]).to.eql([3, 4]);
		expect(values[4]).to.eql([4, 5]);
	});

	it('can compute rolling window - even data set with odd period', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(3)
            .select((window, windowIndex) => [windowIndex, window.toArray()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([0, 1, 2, 3]);

		var values = windowed.toArray();
		expect(values.length).to.eql(4);
		expect(values[0]).to.eql([0, 1, 2]);
		expect(values[1]).to.eql([1, 2, 3]);
		expect(values[2]).to.eql([2, 3, 4]);
		expect(values[3]).to.eql([3, 4, 5]);
	});

	it('can compute rolling window - can take last index and value from each window', function () {

		var series = new Series({ index: [0, 1, 2, 3, 4, 5], values: [0, 1, 2, 3, 4, 5] });
		var windowed = series
			.rollingWindow(3)
			.select(window => [window.getIndex().last(), window.last()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		var index = windowed.getIndex().toArray();
		expect(index).to.eql([2, 3, 4, 5]);

		var values = windowed.toArray();
		expect(values).to.eql([2, 3, 4, 5]);
	});

    it('can compute amount changed', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.amountChange();
		expect(modified.getIndex().toArray()).to.eql([1, 2, 3]);
		expect(modified.toArray()).to.eql([1, 2, 4]);
    });

	it('can compute range', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.amountRange(3);
		expect(modified.toArray()).to.eql([3, 6]);
    });    

	it('can compute proportion range', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.proportionRange(3);
		expect(modified.toArray()).to.eql([0.75, 0.75]);
    });

	it('can compute pct range', function () {
		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.percentRange(3);
		expect(modified.toArray()).to.eql([75, 75]);
    });

	it('can compute amount changed with custom period', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.amountChange(3);
		expect(modified.getIndex().toArray()).to.eql([2, 3]);
		expect(modified.toArray()).to.eql([3, 6]);
    });    

	it('can compute proportion changed', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.proportionChange();
		expect(modified.getIndex().toArray()).to.eql([1, 2, 3]);
		expect(modified.toArray()).to.eql([1, 1, 1]);
    });

	it('can compute proportion changed with custom period', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.proportionChange(3);
		expect(modified.getIndex().toArray()).to.eql([2, 3]);
		expect(modified.toArray()).to.eql([3, 3]);
    });
    
	it('can compute pct changed', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.percentChange();
		expect(modified.getIndex().toArray()).to.eql([1, 2, 3]);
		expect(modified.toArray()).to.eql([100, 100, 100]);
    });

	it('can compute pct changed with custom period', function () {

		var series = new Series({ index: [0, 1, 2, 3], values: [1, 2, 4, 8] });
		var modified = series.percentChange(3);
		expect(modified.getIndex().toArray()).to.eql([2, 3]);
		expect(modified.toArray()).to.eql([300, 300]);
    });

    it('can compute proportion changed', () => {

        const series = new Series([ 
            0.037334329, 
            0.336134454,
            0.018611576,
            0.967621883,
            -0.921489126,
            0.241815476,
            -0.074225274,
            -0.761374188,
            0.449101796,
            -0.838301043,
            -0.394514372,
            0.132025651,
            -0.433226596,
            -0.851305335,
            0.648731158,
        ]);
        const proportionRank = series.proportionRank(3); 
        expect(proportionRank.toPairs()).to.eql([ 
            [ 3, 1 ],
            [ 4, 0 ],
            [ 5, 0.6666666666666666 ],
            [ 6, 0.3333333333333333 ],
            [ 7, 0.3333333333333333 ],
            [ 8, 1 ],
            [ 9, 0 ],
            [ 10, 0.6666666666666666 ],
            [ 11, 0.6666666666666666 ],
            [ 12, 0.3333333333333333 ],
            [ 13, 0 ],
            [ 14, 1 ] 
        ]);
    });
    
    it('can compute percent changed', () => {

        const series = new Series([ 
            0.037334329, 
            0.336134454,
            0.018611576,
            0.967621883,
            -0.921489126,
            0.241815476,
            -0.074225274,
            -0.761374188,
            0.449101796,
            -0.838301043,
            -0.394514372,
            0.132025651,
            -0.433226596,
            -0.851305335,
            0.648731158,
        ]);
        const percentRank = series.percentRank(3); 
        expect(percentRank.toPairs()).to.eql([ 
            [ 3, 100 ],
            [ 4, 0 ],
            [ 5, 66.66666666666666 ],
            [ 6, 33.33333333333333 ],
            [ 7, 33.33333333333333 ],
            [ 8, 100 ],
            [ 9, 0 ],
            [ 10, 66.66666666666666 ],
            [ 11, 66.66666666666666 ],
            [ 12, 33.33333333333333 ],
            [ 13, 0 ],
            [ 14, 100 ] 
        ]);
    });

	it('variable window', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 1, 1, 2, 3, 4, 3, 3],
		});

		var windowed = series
			.variableWindow((a, b) => a === b)
            .select(window => [window.getIndex().first(), window.count()])
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]);

		expect(windowed.toPairs()).to.eql([
			[0, 2],
			[2, 1],
			[3, 2],
			[5, 1],
			[6, 1],
			[7, 1],
			[8, 2]
		]);
	});
    
	it('variable window compares each adjacent pair', () => {

		var df = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			values: [1, 2, 3, 4, 3, 3, 3, 4, 5, 8, 9],
		});

		var windowed = df
			.variableWindow((a, b) => a === b-1)
            .select(window => window.toArray());

		expect(windowed.toArray()).to.eql([
            [1, 2, 3, 4],
            [3],
            [3],
            [3, 4, 5],
            [8, 9],
		]);
	});
    
	it('can collapse sequential duplicates and take first index', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [1, 1, 2, 3, 3, 3, 5, 6, 6, 7],
		});

		var collapsed = series.sequentialDistinct();

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[3, 3],
			[6, 5],
			[7, 6],
			[9, 7],
		]);
	});

	it('can collapse sequential duplicates with custom selector', function () {

		var series = new Series({ 
			index:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			values: [{ A: 1 }, { A: 1 }, { A: 2 }, { A: 3 }, { A: 3 }, { A: 3 }, { A: 5 }, { A: 6 }, { A: 6 }, { A: 7 }],
		});

		var collapsed = series
			.sequentialDistinct(value => value.A)
			.select(value => value.A)
			;

		expect(collapsed.toPairs()).to.eql([
			[0, 1],
			[2, 2],
			[3, 3],
			[6, 5],
			[7, 6],
			[9, 7],
		]);
    });
});