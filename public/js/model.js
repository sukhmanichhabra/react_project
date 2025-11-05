let currentStep = 1;
        let questionsPerStep = 4;
        let answeredQuestions = 0;
        let currentQuestion = 0;

        function updateProgress(isGoingBack = false) {
            if (isGoingBack) {
                answeredQuestions = Math.max(0, answeredQuestions - 1);
                currentQuestion = Math.max(0, currentQuestion - 1);
            } else {
                answeredQuestions++;
                currentQuestion++;
            }

            
            const totalQuestions = questionsPerStep * 3; 
            const progressPercentage = ((currentQuestion) / totalQuestions) * 100;
            
            
            document.getElementById('progressLineFilled').style.width = `${progressPercentage}%`;

            
            const completedSteps = Math.floor(currentQuestion / questionsPerStep);
            const currentStepNumber = Math.ceil(currentQuestion / questionsPerStep);

            document.querySelectorAll('.progress-step').forEach((step, index) => {
                step.classList.remove('active');
                const circle = step.querySelector('.progress-circle');
                circle.classList.remove('active', 'completed');

                if (index < completedSteps) {
                    
                    circle.classList.add('completed');
                } else if (index === currentStepNumber - 1) {
                    
                    step.classList.add('active');
                    circle.classList.add('active');
                    circle.textContent = index + 1;
                } else {
                    
                    circle.textContent = index + 1;
                }
            });
        }

        function goBack() {
            const currentPage = document.querySelector('[style*="display: block"]');
            if (currentPage.id === 'predictionPage') {
                currentPage.style.display = 'none';
                document.getElementById('utilitiesPage').style.display = 'block';
            } else if (currentPage.id === 'utilitiesPage') {
                currentPage.style.display = 'none';
                document.getElementById('pollutionPage').style.display = 'block';
            } else if (currentPage.id === 'pollutionPage') {
                currentPage.style.display = 'none';
                document.getElementById('viewPage').style.display = 'block';
            } else if (currentPage.id === 'viewPage') {
                currentPage.style.display = 'none';
                document.getElementById('hoaPage').style.display = 'block';
            } else if (currentPage.id === 'hoaPage') {
                currentPage.style.display = 'none';
                document.getElementById('amenitiesPage').style.display = 'block';
            } else if (currentPage.id === 'amenitiesPage') {
                currentPage.style.display = 'none';
                document.getElementById('proximityPage').style.display = 'block';
            } else if (currentPage.id === 'proximityPage') {
                currentPage.style.display = 'none';
                document.getElementById('localityPage').style.display = 'block';
            } else if (currentPage.id === 'localityPage') {
                currentPage.style.display = 'none';
                document.getElementById('cityPage').style.display = 'block';
            } else if (currentPage.id === 'cityPage') {
                currentPage.style.display = 'none';
                document.getElementById('conditionPage').style.display = 'block';
            } else if (currentPage.id === 'conditionPage') {
                currentPage.style.display = 'none';
                document.getElementById('areaPage').style.display = 'block';
            } else if (currentPage.id === 'areaPage') {
                currentPage.style.display = 'none';
                document.getElementById('sliderPage').style.display = 'block';
            } else if (currentPage.id === 'sliderPage') {
                currentPage.style.display = 'none';
                document.querySelector('.cards-grid').classList.remove('hidden');
            }
            updateProgress(true);
        }

        function selectCard(card) {
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            
            setTimeout(() => {
                document.querySelector('.cards-grid').classList.add('hidden');
                document.getElementById('sliderPage').style.display = 'block';
                updateProgress();
            }, 500);
        }

        function nextPage() {
            const currentPage = document.querySelector('[style*="display: block"]');
            console.log('Current page:', currentPage.id); 
            
            
            let isValid = true;
            
            switch(currentPage.id) {
                case 'sliderPage':
                    isValid = validateSliders();
                    break;
                case 'areaPage':
                    isValid = validateArea();
                    break;
                case 'conditionPage':
                    isValid = validateCondition();
                    break;
                case 'cityPage':
                    isValid = validateCity();
                    break;
                case 'localityPage':
                    isValid = validateLocality();
                    break;
                case 'proximityPage':
                    isValid = validateProximity();
                    break;
                case 'amenitiesPage':
                    isValid = validateAmenities();
                    break;
                case 'hoaPage':
                    isValid = validateHOA();
                    break;
                case 'viewPage':
                    isValid = validateView();
                    break;
                case 'pollutionPage':
                    isValid = validatePollution();
                    break;
                case 'utilitiesPage':
                    isValid = validateUtilities();
                    break;
            }

            
            if (!isValid) {
                return;
            }

            
            if (currentPage.id === 'sliderPage') {
                currentPage.style.display = 'none';
                document.getElementById('areaPage').style.display = 'block';
            } else if (currentPage.id === 'areaPage') {
                currentPage.style.display = 'none';
                document.getElementById('conditionPage').style.display = 'block';
            } else if (currentPage.id === 'conditionPage') {
                currentPage.style.display = 'none';
                document.getElementById('cityPage').style.display = 'block';
            } else if (currentPage.id === 'cityPage') {
                currentPage.style.display = 'none';
                document.getElementById('localityPage').style.display = 'block';
                loadLocalities();
            } else if (currentPage.id === 'localityPage') {
                currentPage.style.display = 'none';
                document.getElementById('proximityPage').style.display = 'block';
            } else if (currentPage.id === 'proximityPage') {
                currentPage.style.display = 'none';
                document.getElementById('amenitiesPage').style.display = 'block';
            } else if (currentPage.id === 'amenitiesPage') {
                currentPage.style.display = 'none';
                document.getElementById('hoaPage').style.display = 'block';
            } else if (currentPage.id === 'hoaPage') {
                currentPage.style.display = 'none';
                document.getElementById('viewPage').style.display = 'block';
            } else if (currentPage.id === 'viewPage') {
                currentPage.style.display = 'none';
                document.getElementById('pollutionPage').style.display = 'block';
            } else if (currentPage.id === 'pollutionPage') {
                currentPage.style.display = 'none';
                document.getElementById('utilitiesPage').style.display = 'block';
            } else if (currentPage.id === 'utilitiesPage') {
                currentPage.style.display = 'none';
                document.getElementById('predictionPage').style.display = 'block';
                calculatePrediction();
            }
            
            updateProgress();
        }

        function initializeProgress() {
            updateProgress(false);
        }

        
        function initializeSliders() {
            const sliders = {
                bedroom: document.getElementById('bedroomSlider'),
                bathroom: document.getElementById('bathroomSlider'),
                parking: document.getElementById('parkingSlider')
            };

            const values = {
                bedroom: document.getElementById('bedroomValue'),
                bathroom: document.getElementById('bathroomValue'),
                parking: document.getElementById('parkingValue')
            };

            
            sliders.bedroom.oninput = function() {
                values.bedroom.textContent = this.value + (this.value === '1' ? ' Bedroom' : ' Bedrooms');
            };

            
            sliders.bathroom.oninput = function() {
                values.bathroom.textContent = this.value + (this.value === '1' ? ' Bathroom' : ' Bathrooms');
            };

            
            sliders.parking.oninput = function() {
                values.parking.textContent = this.value + (this.value === '1' ? ' Parking' : ' Parking Spaces');
            };
        }

        
        function initializeAreaSlider() {
            const areaSlider = document.getElementById('areaSlider');
            const areaValue = document.getElementById('areaValue');

            areaSlider.oninput = function() {
                areaValue.textContent = this.value + ' sq ft';
            };
        }

        
        function selectFurnishing(card) {
            document.querySelectorAll('.furnishing-card').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
        }

        const conditionDescriptions = {
            'Poor': 'Needs major repairs, renovation or rebuilding. Multiple structural or mechanical issues present.',
            'Fair': 'Livable but needs significant repairs or updates. Some systems may need replacement.',
            'Good': 'Well maintained with minor repairs needed. Most systems are functional.',
            'Very Good': 'Recently updated with modern amenities. All systems in great working condition.',
            'Excellent': 'Like new condition with premium features. No repairs needed, move-in ready.'
        };

        function validateYear(input) {
            const year = parseInt(input.value);
            const currentYear = new Date().getFullYear();
            
            if (year < 1900) input.value = 1900;
            if (year > currentYear) input.value = currentYear;
        }

        function selectCondition(element, condition) {
            document.querySelectorAll('.condition-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            element.classList.add('selected');
            
            document.getElementById('conditionDescription').textContent = 
                conditionDescriptions[condition];
        }

        let selectedCity = '';

        function selectCity(card) {
            document.querySelectorAll('.city-card').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            selectedCity = card.querySelector('.city-name').textContent;
        }

        
        const cityLocalities = {
            'Mumbai': [
                { name: 'Bandra West', info: 'Premium residential area with seafront' },
                { name: 'Andheri West', info: 'Entertainment hub with metro connectivity' },
                { name: 'Powai', info: 'Modern township near IIT Bombay' },
                { name: 'Worli', info: 'Luxury high-rises with sea view' },
                { name: 'Juhu', info: 'Beach-side celebrity neighborhood' },
                { name: 'Colaba', info: 'Historic south Mumbai district' }
            ],
            'Delhi': [
                { name: 'South Extension', info: 'Upscale residential and shopping area' },
                { name: 'Vasant Kunj', info: 'Premium residential colony' },
                { name: 'Dwarka', info: 'Planned residential suburb' },
                { name: 'Greater Kailash', info: 'Posh residential area' },
                { name: 'Hauz Khas', info: 'Cultural hub with modern amenities' },
                { name: 'Defence Colony', info: 'Premium residential area' }
            ],
            'Bangalore': [
                { name: 'Indiranagar', info: 'Trendy area with cafes and startups' },
                { name: 'Koramangala', info: 'Tech hub with vibrant lifestyle' },
                { name: 'Whitefield', info: 'IT corridor with luxury apartments' },
                { name: 'JP Nagar', info: 'Well-planned residential area' },
                { name: 'HSR Layout', info: 'Tech professionals\' preferred locality' },
                { name: 'Jayanagar', info: 'Traditional residential area' }
            ],
            'Hyderabad': [
                { name: 'Banjara Hills', info: 'Upscale residential area' },
                { name: 'Jubilee Hills', info: 'Premium residential locality' },
                { name: 'Gachibowli', info: 'IT hub with modern amenities' },
                { name: 'HITEC City', info: 'Tech park with residential zones' },
                { name: 'Madhapur', info: 'Commercial and residential hub' },
                { name: 'Kondapur', info: 'Growing residential area' }
            ],
            'Chennai': [
                { name: 'Anna Nagar', info: 'Planned residential area' },
                { name: 'T Nagar', info: 'Shopping and residential hub' },
                { name: 'Adyar', info: 'Premium residential area' },
                { name: 'Velachery', info: 'IT corridor residential area' },
                { name: 'Besant Nagar', info: 'Beach-side residential area' },
                { name: 'Mylapore', info: 'Cultural and residential hub' }
            ],
            'Pune': [
                { name: 'Koregaon Park', info: 'Premium lifestyle district' },
                { name: 'Kalyani Nagar', info: 'Upscale residential area' },
                { name: 'Viman Nagar', info: 'Modern residential hub' },
                { name: 'Baner', info: 'IT professionals\' preferred area' },
                { name: 'Kothrud', info: 'Traditional residential area' },
                { name: 'Magarpatta City', info: 'Integrated township' }
            ]
        };

        function loadLocalities() {
            const localityCardsDiv = document.getElementById('localityCards');
            localityCardsDiv.innerHTML = ''; 

            const localities = cityLocalities[selectedCity];
            if (localities) {
                localities.forEach(locality => {
                    localityCardsDiv.innerHTML += `
                        <div class="locality-card" onclick="selectLocality(this)">
                            <div class="locality-name">${locality.name}</div>
                            <div class="locality-info">${locality.info}</div>
                        </div>
                    `;
                });
            }
        }

        function selectLocality(card) {
            document.querySelectorAll('.locality-card').forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
        }

        function getProximityDescription(type, value) {
            const descriptions = {
                airport: {
                    close: "Very close to airport, might experience some noise",
                    moderate: "Moderate distance from airport, balanced for convenience and noise",
                    far: "Far from airport, longer travel time but quieter area"
                },
                railway: {
                    close: "Walking distance to railway station, excellent for commuters",
                    moderate: "Good access to railway station for daily commute",
                    far: "Limited railway access, might need additional transport"
                },
                bus: {
                    close: "Walking distance to bus stand, convenient for public transport",
                    moderate: "Short travel to bus stand, good connectivity",
                    far: "Limited bus access, might need private transport"
                }
            };

            if (type === 'airport') {
                return value <= 10 ? descriptions.airport.close :
                       value <= 25 ? descriptions.airport.moderate :
                       descriptions.airport.far;
            } else if (type === 'railway') {
                return value <= 3 ? descriptions.railway.close :
                       value <= 10 ? descriptions.railway.moderate :
                       descriptions.railway.far;
            } else {
                return value <= 1 ? descriptions.bus.close :
                       value <= 5 ? descriptions.bus.moderate :
                       descriptions.bus.far;
            }
        }

        function updateProximityValue(type) {
            const value = document.getElementById(`${type}Slider`).value;
            document.getElementById(`${type}Value`).textContent = `${value} km`;
            document.getElementById(`${type}Description`).textContent = 
                getProximityDescription(type, parseFloat(value));
        }

        const amenityDescriptions = {
            hospital: {
                'close': 'Excellent access to medical facilities',
                'medium': 'Good access to medical facilities',
                'far': 'Medical facilities require some travel'
            },
            market: {
                'close': 'Very convenient for daily shopping',
                'medium': 'Walking distance to supermarket',
                'far': 'Short drive to supermarket'
            },
            school: {
                'close': 'Ideal for families with school-going children',
                'medium': 'Reasonable distance to educational institutions',
                'far': 'May need transportation for school'
            },
            mall: {
                'close': 'Shopping mall within walking distance',
                'medium': 'Easy access to shopping mall',
                'far': 'Shopping mall requires some travel'
            },
            store: {
                'close': 'Convenience store at doorstep',
                'medium': 'Easy walk to convenience store',
                'far': 'Short walk to convenience store'
            },
            pharmacy: {
                'close': 'Pharmacy nearby for emergencies',
                'medium': 'Good access to pharmacy',
                'far': 'Pharmacy within walking distance'
            }
        };

        function selectDistance(element, type) {
            console.log('Toggling distance for:', type);
            
            
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
                return;
            }
            
            
            const parentCard = element.closest('.amenity-card');
            if (parentCard) {
                parentCard.querySelectorAll('.distance-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                
                element.classList.add('selected');
            }
        }

        function selectFeeOption(element, type) {
            document.querySelectorAll('.fee-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            element.classList.add('selected');
            
            
            const amenities = {
                basic: ['security', 'cleaning'],
                standard: ['security', 'cleaning', 'parking'],
                premium: ['security', 'cleaning', 'parking', 'gym', 'pool'],
                luxury: ['security', 'cleaning', 'parking', 'gym', 'pool', 'clubhouse']
            };
            
            
            document.querySelectorAll('.amenity-checkbox input').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            
            amenities[type].forEach(amenity => {
                document.getElementById(amenity).checked = true;
            });
        }

        function updateHOADetails() {
            
        }

        let selectedView = '';

        function selectView(element, type) {
            document.querySelectorAll('.view-card').forEach(card => {
                card.classList.remove('selected');
            });
            element.classList.add('selected');
            
            selectedView = type;
        }

        
        window.onload = function() {
            initializeSliders();
            initializeAreaSlider();
        }

        const pollutionDescriptions = {
            air: {
                excellent: "Very clean air with minimal pollution. Ideal for outdoor activities.",
                good: "Generally clean air with occasional mild pollution.",
                moderate: "Moderate air quality with occasional pollution during peak hours.",
                poor: "Noticeable air pollution that might affect sensitive individuals.",
                veryPoor: "Significant air pollution. Outdoor activities might be restricted."
            },
            noise: {
                veryQuiet: "Peaceful environment with minimal urban noise.",
                quiet: "Low noise levels, suitable for residential area.",
                moderate: "Average urban noise levels with periodic traffic sounds.",
                noisy: "Considerable noise from traffic and urban activities.",
                veryNoisy: "High noise levels that might affect daily activities."
            }
        };

        function updatePollutionLevel(type, value) {
            const val = parseInt(value);
            let level, description;

            if (type === 'air') {
                if (val <= 20) {
                    level = 'Excellent';
                    description = pollutionDescriptions.air.excellent;
                } else if (val <= 40) {
                    level = 'Good';
                    description = pollutionDescriptions.air.good;
                } else if (val <= 60) {
                    level = 'Moderate';
                    description = pollutionDescriptions.air.moderate;
                } else if (val <= 80) {
                    level = 'Poor';
                    description = pollutionDescriptions.air.poor;
                } else {
                    level = 'Very Poor';
                    description = pollutionDescriptions.air.veryPoor;
                }
                document.getElementById('airQualityValue').textContent = level;
                document.getElementById('airQualityDesc').textContent = description;
            } else {
                if (val <= 20) {
                    level = 'Very Quiet';
                    description = pollutionDescriptions.noise.veryQuiet;
                } else if (val <= 40) {
                    level = 'Quiet';
                    description = pollutionDescriptions.noise.quiet;
                } else if (val <= 60) {
                    level = 'Moderate';
                    description = pollutionDescriptions.noise.moderate;
                } else if (val <= 80) {
                    level = 'Noisy';
                    description = pollutionDescriptions.noise.noisy;
                } else {
                    level = 'Very Noisy';
                    description = pollutionDescriptions.noise.veryNoisy;
                }
                document.getElementById('noiseLevelValue').textContent = level;
                document.getElementById('noiseLevelDesc').textContent = description;
            }
        }

        function updateConsumption(type, value) {
            const unit = type === 'electricity' ? 'kWh' : 'L';
            document.getElementById(`${type}Value`).textContent = `${value} ${unit}`;
            updateEfficiencyRating(type, value);
        }

        function updateUtilityEfficiency(type, cost) {
            const usage = document.getElementById(`${type}Slider`).value;
            updateEfficiencyRating(type, usage, cost);
        }

        function updateEfficiencyRating(type, usage, cost = null) {
            const efficiencyElement = document.getElementById(`${type}Efficiency`);
            let message = '';
            let icon = '';

            if (type === 'electricity') {
                if (usage < 300) {
                    message = 'Excellent energy efficiency';
                    icon = '🌟';
                } else if (usage < 500) {
                    message = 'Average consumption for this property size';
                    icon = '📊';
                } else {
                    message = 'High consumption, consider energy-saving measures';
                    icon = '⚠️';
                }
            } else {
                if (usage < 8000) {
                    message = 'Excellent water conservation';
                    icon = '🌟';
                } else if (usage < 15000) {
                    message = 'Average water consumption for this property size';
                    icon = '📊';
                } else {
                    message = 'High water usage, consider water-saving fixtures';
                    icon = '⚠️';
                }
            }

            efficiencyElement.innerHTML = `
                <span class="rating-icon">${icon}</span>
                <span class="rating-text">${message}</span>
            `;
        }

        function startOver() {
            window.location.reload();
        }

            function returnValues() {
                    
                    const userInputs = [
                        
                        document.querySelector('.property-card.selected')?.querySelector('.property-title')?.textContent || 'Not selected',

                        
                        document.getElementById('bedroomSlider')?.value || 'Not specified',
                        document.getElementById('bathroomSlider')?.value || 'Not specified',
                        document.getElementById('parkingSlider')?.value || 'Not specified',

                        
                        document.getElementById('areaSlider')?.value || 'Not specified',
                        document.querySelector('.furnishing-card.selected')?.querySelector('.furnishing-title')?.textContent || 'Not selected',

                        
                        document.getElementById('yearInput')?.value || 'Not specified',
                        document.querySelector('.condition-option.selected')?.textContent || 'Not selected',

                        
                        document.querySelector('.city-card.selected')?.querySelector('.city-name')?.textContent || 'Not selected',

                        
                        document.querySelector('.locality-card.selected')?.querySelector('.locality-name')?.textContent || 'Not selected',

                        
                        document.getElementById('airportSlider')?.value || 'Not specified',
                        document.getElementById('railwaySlider')?.value || 'Not specified',
                        document.getElementById('busSlider')?.value || 'Not specified',

                        
                        document.querySelector('.hospital-distance.selected')?.textContent || 'Not selected',
                        document.querySelector('.supermarket-distance.selected')?.textContent || 'Not selected',
                        document.querySelector('.school-distance.selected')?.textContent || 'Not selected',
                        document.querySelector('.mall-distance.selected')?.textContent || 'Not selected',
                        document.querySelector('.store-distance.selected')?.textContent || 'Not selected',
                        document.querySelector('.pharmacy-distance.selected')?.textContent || 'Not selected',

                        
                        document.getElementById('hoaFee')?.value || 'Not specified',
                        Array.from(document.querySelectorAll('.amenity-checkbox input:checked')).map(cb =>
                            cb.nextElementSibling?.textContent || 'Unknown'
                        ).join(', ') || 'No amenities selected',

                        
                        document.querySelector('.view-card.selected')?.querySelector('.view-title')?.textContent || 'Not selected',

                        
                        document.getElementById('airQualitySlider')?.value || 'Not specified',
                        document.getElementById('noiseLevelSlider')?.value || 'Not specified',

                        
                        document.getElementById('electricityCost')?.value || 'Not specified',
                        document.getElementById('waterCost')?.value || 'Not specified'
                    ];

                    
                    console.log('Complete User Inputs List:');
                    console.log('1. Property Type:', userInputs[0]);
                    console.log('2. Bedrooms:', userInputs[1]);
                    console.log('3. Bathrooms:', userInputs[2]);
                    console.log('4. Parking:', userInputs[3]);
                    console.log('5. Area:', userInputs[4]);
                    console.log('6. Furnishing:', userInputs[5]);
                    console.log('7. Construction Year:', userInputs[6]);
                    console.log('8. Condition:', userInputs[7]);
                    console.log('9. City:', userInputs[8]);
                    console.log('10. Locality:', userInputs[9]);
                    console.log('11. Airport Distance:', userInputs[10]);
                    console.log('12. Railway Distance:', userInputs[11]);
                    console.log('13. Bus Distance:', userInputs[12]);
                    console.log('14. Hospital Distance:', userInputs[13]);
                    console.log('15. Supermarket Distance:', userInputs[14]);
                    console.log('16. School Distance:', userInputs[15]);
                    console.log('17. Mall Distance:', userInputs[16]);
                    console.log('18. Store Distance:', userInputs[17]);
                    console.log('19. Pharmacy Distance:', userInputs[18]);
                    console.log('20. HOA Fee:', userInputs[19]);
                    console.log('21. HOA Amenities:', userInputs[20]);
                    console.log('22. View Type:', userInputs[21]);
                    console.log('23. Air Quality:', userInputs[22]);
                    console.log('24. Noise Level:', userInputs[23]);
                    console.log('25. Electricity Cost:', userInputs[24]);
                    console.log('26. Water Cost:', userInputs[25]);

                    return userInputs;
                }

        function calculatePrediction() {

            returnValues();
            
            const propertyDetails = {
                
                propertyType: document.querySelector('.property-card.selected')?.querySelector('.property-title')?.textContent,
                
                
                bedrooms: document.getElementById('bedroomSlider')?.value,
                bathrooms: document.getElementById('bathroomSlider')?.value,
                parking: document.getElementById('parkingSlider')?.value,
                
                
                area: document.getElementById('areaSlider')?.value,
                furnishing: document.querySelector('.furnishing-card.selected')?.querySelector('.furnishing-title')?.textContent,
                
                
                year: document.getElementById('yearInput')?.value,
                condition: document.querySelector('.condition-option.selected')?.textContent,
                
                
                city: document.querySelector('.city-card.selected')?.querySelector('.city-name')?.textContent,
                
                
                locality: document.querySelector('.locality-card.selected')?.querySelector('.locality-name')?.textContent,
                
                
                airportDistance: document.getElementById('airportSlider')?.value,
                railwayDistance: document.getElementById('railwaySlider')?.value,
                busDistance: document.getElementById('busSlider')?.value,
                
                
                
                
                
                hoaFee: document.getElementById('hoaFee')?.value,
                hoaAmenities: Array.from(document.querySelectorAll('.amenity-checkbox input:checked')).map(cb => 
                    cb.nextElementSibling?.textContent
                ),
                
                
                view: document.querySelector('.view-card.selected')?.querySelector('.view-title')?.textContent,
                
                
                airQuality: document.getElementById('airQualitySlider')?.value,
                noiseLevel: document.getElementById('noiseLevelSlider')?.value,
                
                
                electricityConsumption: document.getElementById('electricitySlider')?.value,
                waterConsumption: document.getElementById('waterSlider')?.value
            };

            
            const detailsContainer = document.getElementById('propertyDetails');
            detailsContainer.innerHTML = Object.entries(propertyDetails)
                .filter(([_, value]) => value) 
                .map(([key, value]) => `
                    <div class="detail-item">
                        <span class="detail-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span class="detail-value">${Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                `).join('');
        }

        
        function validatePropertyType() {
            const selected = document.querySelector('.property-card.selected');
            if (!selected) {
                alert('Please select a property type');
                return false;
            }
            return true;
        }

        function validateSliders() {
            const bedrooms = document.getElementById('bedroomSlider').value;
            const bathrooms = document.getElementById('bathroomSlider').value;
            const parking = document.getElementById('parkingSlider').value;
            
            if (bedrooms === '0' || bathrooms === '0' || parking === '0') {
                alert('Please specify number of bedrooms, bathrooms, and parking spots');
                return false;
            }
            return true;
        }

        function validateArea() {
            const area = document.getElementById('areaSlider').value;
            const furnishing = document.querySelector('.furnishing-card.selected');
            
            if (area === '0' || !furnishing) {
                alert('Please specify area and furnishing status');
                return false;
            }
            return true;
        }

        
        function validateCondition() {
            console.log('Starting condition validation...'); 
            
            
            const selectedCondition = document.querySelector('.condition-option.selected');
            console.log('Selected condition:', selectedCondition?.textContent);

            if (!selectedCondition) {
                alert('Please select a property condition');
                return false;
            }

            console.log('Validation passed successfully!');
            return true;
        }

        function validateCity() {
            const selected = document.querySelector('.city-card.selected');
            if (!selected) {
                alert('Please select a city');
                return false;
            }
            return true;
        }

        function validateLocality() {
            const selected = document.querySelector('.locality-card.selected');
            if (!selected) {
                alert('Please select a locality');
                return false;
            }
            return true;
        }

        function validateProximity() {
            const airport = document.getElementById('airportSlider').value;
            const railway = document.getElementById('railwaySlider').value;
            const bus = document.getElementById('busSlider').value;
            
            if (airport === '0' || railway === '0' || bus === '0') {
                alert('Please specify distances to all transport hubs');
                return false;
            }
            return true;
        }

        function validateAmenities() {
            console.log('Validating amenities...');
            
            
            const selectedDistances = document.querySelectorAll('.distance-option.selected');
            
            if (selectedDistances.length === 0) {
                alert('Please select at least one amenity distance');
                return false;
            }

            console.log('Amenities validation passed');
            return true;
        }

        function validateHOA() {
            const hoaFee = document.getElementById('hoaFee').value;
            const selectedAmenities = document.querySelectorAll('.amenity-checkbox input:checked');
            
            if (!hoaFee || selectedAmenities.length === 0) {
                alert('Please specify HOA fee and select included amenities');
                return false;
            }
            return true;
        }

        function validateView() {
            const selected = document.querySelector('.view-card.selected');
            if (!selected) {
                alert('Please select a view type');
                return false;
            }
            return true;
        }

        function validatePollution() {
            const airQuality = document.getElementById('airQualitySlider').value;
            const noiseLevel = document.getElementById('noiseLevelSlider').value;
            
            if (airQuality === '0' || noiseLevel === '0') {
                alert('Please specify both air quality and noise levels');
                return false;
            }
            return true;
        }

        function validateUtilities() {
            const electricityCost = document.getElementById('electricityCost').value;
            const waterCost = document.getElementById('waterCost').value;
            
            if (!electricityCost || electricityCost <= 0) {
                alert('Please enter a valid electricity cost');
                return false;
            }
            
            if (!waterCost || waterCost <= 0) {
                alert('Please enter a valid water cost');
                return false;
            }
            
            return true;
        }

        
        function selectCondition(element) {
            console.log('Condition selected:', element.textContent);
            
            
            document.querySelectorAll('.condition-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            
            element.classList.add('selected');
        }

        
        document.addEventListener('DOMContentLoaded', function() {
            const conditionOptions = document.querySelectorAll('.condition-option');
            conditionOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectCondition(this);
                });
            });
        });

        
        document.getElementById('yearInput')?.addEventListener('input', function(e) {
            console.log('Year input changed:', e.target.value); 
        });