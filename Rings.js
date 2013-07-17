d3.csv('continent_data/olympics_with_continents.csv', function (data) {

    /*
	Generate the data strucutres
	*/

    var population = {
        'Africa': 1032532974,
        'Asia': 4164252000,
        'Europe': 739165030,
        'Americas': 911000000,
        'Oceania': 35670000
    };

    var sumMedal = function (d, hash) {
        var total_gold = d3.sum(d, function (i) {
            return (i[hash]);
        })
        return Math.round(total_gold);
    }

    var sumSex = function (d, hash) {
        var total_Sex = d3.sum(d, function (i) {
            return i.Sex == hash ? 1 : 0;
        })
        return total_Sex
    }

    var getPop = function (d) {
        var population = {
            'Africa': 1032532974,
            'Asia': 4164252000,
            'Europe': 739165030,
            'Americas': 911000000,
            'Oceania': 35670000
        };
        return population[d[0].Continent]
    }

    var getGDP = function (d) {
        var GDP = {
            'Africa': 1638404000000,
            'Asia': 12084604000000,
            'Europe': 18806370000000,
            'Americas': 17587792000000 + 3535527000000,
            'Oceania': 1392028000000
        };
        return GDP[d[0].Continent]
    }

    var sumCountries = function (d) {
        var countries = d3.nest().key(function (k) {
            return k.Country;
        }).entries(d).length;
        return countries;
    }

    var rollup_data = d3.nest().key(function (d) {
							        return d.Continent
							    })
    							.sortKeys(function (a, b) {
							        return ((a == 'Americas' || a == 'Asia') ? -1 : 1);
							        return 0;
							    })
							    .rollup(function (d) {
							        var gold = sumMedal(d, 'Gold');
							        var silver = sumMedal(d, 'Silver');
							        var bronze = sumMedal(d, 'Bronze');
							        var athlets = d.length;
							        var nAthletics = d3.nest().key(function (d) {
														            return d.Sport;
														        })
														        .entries(d).filter(function (d) {
														            return d.key == 'Athletics';
														        })[0]
														        .values.length;
							        var nMales = sumSex(d, 'M');
							        var nFames = sumSex(d, 'F');
							        var nHabis = getPop(d);
							        var nCountries = sumCountries(d);
							        var GDP = getGDP(d);

							        return {
							            'Gold': gold,
							            'Silver': silver,
							            'Bronze': bronze,
							            'Total': (gold + silver + bronze),
							            'Athletes': athlets,
							            'Athletics': nAthletics,
							            'Males': nMales,
							            'Females': nFames,
							            'People': nHabis,
							            'Countries': nCountries,
							            'GDP': GDP
							        };
							    })
								.entries(data).filter(function (d) {
							        if (d.key == '') {
							            return false;
							        }
							        return true;
							    });

    /*
	SVG creation
	*/

    body = d3.select('body');
    svg = body.append('svg').attr('height', 700).attr('width', 1000);

    /*
	Creation of basic medals_ring
	*/

    var inRadius = 39;
    var outRadius = 50;
    var centerX = 500;
    var centerY = 150;
    var circleDistance = 20;

    makeRing = function (property, xpos, ypos) {
        var arc = d3.svg.arc().innerRadius(inRadius).outerRadius(outRadius);

        var pie = d3.layout.pie().value(function (d) {
            return d.values[property];
        });

        var ring = svg.append('g')
        				.attr('id', property)
        				.attr('transform', 'translate(' + (centerX - xpos) + ',' + (centerY + ypos) + ')')
        				.style('z-index', '999')
        				.style('display', 'block');

        ring.selectAll('path')
        	.data(pie(rollup_data))
        	.enter()
        		.append('g')
        		.attr('class', function (d) {
            		return d.data.key;
        		})
        		.append('path')
        		.attr('d', arc);

        ring.append('circle')
        	.attr('r', inRadius)
        	.attr('opacity', 0); //this circle allow to click inside the cirle
        
        ring.append('text')
        	.text(property)
        	.attr('y', 5)
        	.style('fill', '#333')
        	.style('text-anchor', 'middle')
        	.style('font-family', 'Arial')
        	.style('font-size', '13px')
        	.style('text-transform', 'uppercase')
        	.style('text-anchor', 'middle');

        /*
        Translation for each ring
        */
        var translations = {
            Europe: [-outRadius * 2 + xpos, -ypos],
            Asia: [-outRadius + xpos, -ypos + outRadius],
            Africa: [+xpos, -ypos],
            Americas: [outRadius + xpos, -ypos + outRadius],
            Oceania: [outRadius * 2 + xpos, -ypos]
        };

        ring.on('click', function () {
            explode_implode_ring(property, translations);
        });

    }

    /*
	Semi-transparent background rings
	*/
    var xPos = {
        Europe: (-outRadius * 2),
        Asia: -outRadius,
        Africa: 0,
        Americas: outRadius,
        Oceania: (outRadius * 2)
    };
    var yPos = {
        Europe: 0,
        Asia: outRadius,
        Africa: 0,
        Americas: outRadius,
        Oceania: 0
    };

    bkg_rings = svg.append('g')
    				.attr('class', 'bkg_rings')
    				.attr('transform', 'translate(' + centerX + ',' + centerY + ')');

    var groupring = bkg_rings.selectAll('path')
    							.data(rollup_data)
    							.enter()
    								.append('g')
    								.attr('class', function (d, i) {
        								return d.key + ' complete';
    							});

    groupring.attr('transform', function (d, i) {
        		return 'translate(' + xPos[d.key] + ',' + yPos[d.key] + ')';
    		})
    		.append('path')
    		.attr('d', d3.svg.arc()
    						.innerRadius(inRadius)
    						.outerRadius(outRadius)
    						.startAngle(0)
    						.endAngle(Math.PI * 2)
    		);

    groupring.append('text')
    			//.text('test')
    			.attr('text-anchor', 'middle')
    			.attr('opacity', 0)
    			.attr('class', 'percent')
    			.attr('dy', '4px');

    groupring.append('text')
    			.text(function (d) {
        			return d.key;
    			})
    			.attr('x', 0)
    			.attr('y', function (d) {
        			if (d.key == 'Asia' || d.key == 'Americas') {
            			return outRadius + 20;
        			} else {
           				 return -outRadius - 20;
        			}
   				 })
    			.style('text-anchor', 'middle').attr('class', 'continent');

    /*
	Rings
	*/

    makeRing('Males', (6 * outRadius + 1.5 * circleDistance), 25);
    makeRing('Total', (3 * outRadius + 1.5 * circleDistance), 250);
    makeRing('Gold', (outRadius + 0.5 * circleDistance), 250);
    makeRing('Silver', -(outRadius + 0.5 * circleDistance), 250);
    makeRing('Bronze', -(3 * outRadius + 1.5 * circleDistance), 250);
    makeRing('Athletes', (6 * outRadius + 1.5 * circleDistance), -100);
    makeRing('Females', (6 * outRadius + 1.5 * circleDistance), 150);
    makeRing('People', -(6 * outRadius + 1.5 * circleDistance), -100);
    makeRing('GDP', -(6 * outRadius + 1.5 * circleDistance), 150);
    makeRing('Countries', -(6 * outRadius + 1.5 * circleDistance), 25);

    /*
	Click beahivor
	*/

    var explode_implode_ring = function (ring_id, translation) {
        var ring_class = '#' + ring_id;
        if (!exploded) {
            groupring.selectAll('path')
            			.transition()
            			.duration(500)
            			.style('opacity', 0.2);

            d3.select(ring_class)
            	.select('.Africa')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Africa'][0] + ',' + translation['Africa'][1] + ')');

            d3.select(ring_class)
            	.select('.Asia')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Asia'][0] + ',' + translation['Asia'][1] + ')');

            d3.select(ring_class)
            	.select('.Europe')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Europe'][0] + ',' + translation['Europe'][1] + ')');

            d3.select(ring_class)
            	.select('.Americas')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Americas'][0] + ',' + translation['Americas'][1] + ')');

            d3.select(ring_class)
            	.select('.Oceania')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Oceania'][0] + ',' + translation['Oceania'][1] + ')');

            currently_exploded = ring_id;
            exploded = true;

            d3.selectAll('.percent').transition().duration(500).attr('opacity', 1).text(function (d) {
                return numbertostring(d.values[ring_id])
            })

            d3.select(ring_class)
            	.selectAll('path')
            	.attr('class', 'exploded');

            //currentRotate = 0;

        } else if (exploded && currently_exploded == ring_id) {
            groupring.selectAll('path')
            			.transition()
            			.duration(500)
            			.style('opacity', 1);

            d3.select(ring_class)
            	.select('.Africa')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(ring_class)
            	.select('.Asia')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(ring_class)
            	.select('.Europe')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(ring_class)
            	.select('.Americas')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(ring_class)
            	.select('.Oceania')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            currently_exploded = null;
            exploded = false;

            d3.selectAll('.percent').transition().duration(250).attr('opacity', 0);

            d3.select(ring_class)
            	.selectAll('path')
            	.attr('class', 'imploded');

            //currentRotate = 0;

        } else if (exploded && currently_exploded != ring_id) {
            var currently_exploded_class = '#' + currently_exploded;

            d3.select(currently_exploded_class)
            	.select('.Africa')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(currently_exploded_class)
            	.select('.Asia')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(currently_exploded_class)
            	.select('.Europe')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(currently_exploded_class)
            	.select('.Americas')
            	.transition()
            	.duration(500)
            	.attr('transform', '');
            	
            d3.select(currently_exploded_class)
            	.select('.Oceania')
            	.transition()
            	.duration(500)
            	.attr('transform', '');

            d3.select(currently_exploded_class)
            	.selectAll('path')
            	.attr('class', 'imploded');

            d3.select(ring_class)
            	.select('.Africa')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Africa'][0] + ',' + translation['Africa'][1] + ')');

            d3.select(ring_class)
            	.select('.Asia')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Asia'][0] + ',' + translation['Asia'][1] + ')');

            d3.select(ring_class)
            	.select('.Europe')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Europe'][0] + ',' + translation['Europe'][1] + ')');

            d3.select(ring_class)
            	.select('.Americas')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Americas'][0] + ',' + translation['Americas'][1] + ')');

            d3.select(ring_class)
            	.select('.Oceania')
            	.transition()
            	.duration(500)
            	.attr('transform', 'translate(' + translation['Oceania'][0] + ',' + translation['Oceania'][1] + ')');

            currently_exploded = ring_id;

            d3.selectAll('.percent')
            	.transition()
            	.duration(250)
            	.attr('opacity', 0)
            	.each("end", function (d) {
                	d3.select(this)
                		.text(function (d) {
                    		return numbertostring(d.values[ring_id])
                		});
                
                	d3.select(this)
                		.transition()
                		.duration(250)
                		.attr('opacity', 1);
            	});

            d3.select(ring_class)
            	.selectAll('path')
            	.attr('class', 'exploded');

            //currentRotate = 0;
        }
    }

    var exploded = false;
    var currently_exploded = null;

    //Code to set the infinite loop rotatatin of the arcs,
    /*
			var currentRotate=0
			var makeRotate = function(){
				console.log(currentRotate)
				currentRotate+=120
				d3.selectAll('path')
					.transition()
					.duration(20000)
					.ease('linear')
					.attr('transform',function(){
						return'rotate('+currentRotate+')'
					})
			}
			makeRotate()
			setInterval(makeRotate,20000);
			
			*/
     /*
    var currentRotate = 0;
    var makeRotate = function () {
        currentRotate += 0.6;

        d3.selectAll('.imploded')
        	.transition()
        	.duration(200)
        	.attr('transform', function () {
            	return 'rotate(0)';
        	});

        d3.selectAll('.exploded')
        	.transition()
        	.duration(100)
        	.ease('linear')
        	.attr('transform', function () {
            	return 'rotate(' + currentRotate + ')';
        	});
    }
    makeRotate();
    setInterval(makeRotate, 100);
    */
});