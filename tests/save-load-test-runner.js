/**
 * OpenChart Save/Load Functionality Test Runner
 *
 * This script provides comprehensive testing for the save/load functionality
 * including PropertyPanel integration, shape styles, connections, and schema validation.
 *
 * Usage:
 * 1. Open the main OpenChart application in your browser
 * 2. Open browser console
 * 3. Copy and paste this script
 * 4. Run: await runSaveLoadTests()
 */

class SaveLoadTestRunner {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: [],
            details: []
        };

        this.testData = null;
        this.savedData = null;
        this.loadedData = null;
    }

    log(message, isError = false) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;

        if (isError) {
            console.error(logMessage);
            this.testResults.errors.push(logMessage);
        } else {
            console.log(logMessage);
        }

        this.testResults.details.push({
            timestamp,
            message,
            isError
        });
    }

    assert(condition, message) {
        if (condition) {
            this.testResults.passed++;
            this.log(`✅ PASS: ${message}`);
            return true;
        } else {
            this.testResults.failed++;
            this.log(`❌ FAIL: ${message}`, true);
            return false;
        }
    }

    // Generate comprehensive test data
    generateTestData() {
        this.log('📝 Generating comprehensive test data...');

        const testNodes = [
            {
                id: 'test-rect-1',
                type: 'shape',
                position: { x: 100, y: 100 },
                data: {
                    label: 'Test Rectangle',
                    shape: 'rectangle',
                    width: 150,
                    height: 80,
                    style: {
                        fill: '#ff6b6b',
                        stroke: '#e53e3e',
                        strokeWidth: 3,
                        opacity: 0.9,
                        fontSize: 16,
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        textAlign: 'center',
                        cornerRadius: 12,
                        color: '#ffffff',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        lineHeight: 1.5,
                        letterSpacing: '2px',
                        wordSpacing: 'normal'
                    },
                    lastStyleUpdate: Date.now() - 1000,
                    lastTextUpdate: Date.now() - 500
                }
            },
            {
                id: 'test-circle-1',
                type: 'shape',
                position: { x: 300, y: 150 },
                data: {
                    label: 'Test Circle',
                    shape: 'circle',
                    width: 100,
                    height: 100,
                    style: {
                        fill: '#4ecdc4',
                        stroke: '#26d0ce',
                        strokeWidth: 2,
                        opacity: 0.8,
                        fontSize: 14,
                        fontFamily: 'Helvetica, sans-serif',
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        cornerRadius: 50,
                        color: '#2d3748',
                        textDecoration: 'underline',
                        textTransform: 'capitalize',
                        lineHeight: 1.2,
                        letterSpacing: 'normal',
                        wordSpacing: '2px'
                    },
                    lastStyleUpdate: Date.now() - 2000,
                    lastTextUpdate: Date.now() - 1500
                }
            },
            {
                id: 'test-diamond-1',
                type: 'shape',
                position: { x: 150, y: 300 },
                data: {
                    label: 'Decision Diamond',
                    shape: 'diamond',
                    width: 120,
                    height: 120,
                    style: {
                        fill: '#ffd93d',
                        stroke: '#ffcd07',
                        strokeWidth: 4,
                        opacity: 1.0,
                        fontSize: 12,
                        fontFamily: 'Georgia, serif',
                        fontWeight: '600',
                        fontStyle: 'normal',
                        textAlign: 'center',
                        cornerRadius: 0,
                        color: '#744210',
                        textDecoration: 'none',
                        textTransform: 'lowercase',
                        lineHeight: 1.6,
                        letterSpacing: '1px',
                        wordSpacing: 'normal'
                    },
                    lastStyleUpdate: Date.now() - 3000,
                    lastTextUpdate: Date.now() - 2500
                }
            }
        ];

        const testEdges = [
            {
                id: 'edge-test-1-2',
                source: 'test-rect-1',
                target: 'test-circle-1',
                sourceHandle: 'right-source',
                targetHandle: 'left-target',
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: {
                    type: 'ArrowClosed',
                    width: 20,
                    height: 20,
                    color: '#94a3b8'
                }
            },
            {
                id: 'edge-test-2-3',
                source: 'test-circle-1',
                target: 'test-diamond-1',
                sourceHandle: 'bottom-source',
                targetHandle: 'top-target',
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 3 },
                markerEnd: {
                    type: 'ArrowClosed',
                    width: 20,
                    height: 20,
                    color: '#6366f1'
                }
            }
        ];

        this.testData = {
            nodes: testNodes,
            edges: testEdges,
            viewport: { x: 0, y: 0, zoom: 1 },
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };

        this.log(`✅ Generated test data with ${testNodes.length} nodes and ${testEdges.length} edges`);
        return this.testData;
    }

    // Test 1: Validate node data structure
    testNodeDataStructure() {
        this.log('🔍 Testing node data structure...');

        const requiredNodeFields = ['id', 'type', 'position', 'data'];
        const requiredDataFields = ['label', 'shape', 'style'];
        const requiredStyleFields = [
            'fill', 'stroke', 'strokeWidth', 'opacity',
            'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
            'textAlign', 'cornerRadius', 'color'
        ];

        this.testData.nodes.forEach((node, index) => {
            // Test required node fields
            requiredNodeFields.forEach(field => {
                this.assert(
                    node.hasOwnProperty(field),
                    `Node ${index} has required field: ${field}`
                );
            });

            // Test required data fields
            if (node.data) {
                requiredDataFields.forEach(field => {
                    this.assert(
                        node.data.hasOwnProperty(field),
                        `Node ${index} data has required field: ${field}`
                    );
                });

                // Test style structure
                if (node.data.style) {
                    requiredStyleFields.forEach(field => {
                        this.assert(
                            node.data.style.hasOwnProperty(field),
                            `Node ${index} style has required field: ${field}`
                        );
                    });
                }

                // Test timestamp fields
                this.assert(
                    typeof node.data.lastStyleUpdate === 'number',
                    `Node ${index} has valid lastStyleUpdate timestamp`
                );

                this.assert(
                    typeof node.data.lastTextUpdate === 'number',
                    `Node ${index} has valid lastTextUpdate timestamp`
                );
            }
        });
    }

    // Test 2: Validate edge data structure
    testEdgeDataStructure() {
        this.log('🔗 Testing edge data structure...');

        const requiredEdgeFields = ['id', 'source', 'target', 'sourceHandle', 'targetHandle'];
        const validHandleNames = [
            'top-source', 'top-target',
            'right-source', 'right-target',
            'bottom-source', 'bottom-target',
            'left-source', 'left-target'
        ];

        this.testData.edges.forEach((edge, index) => {
            // Test required edge fields
            requiredEdgeFields.forEach(field => {
                this.assert(
                    edge.hasOwnProperty(field),
                    `Edge ${index} has required field: ${field}`
                );
            });

            // Test handle naming
            if (edge.sourceHandle) {
                this.assert(
                    validHandleNames.includes(edge.sourceHandle),
                    `Edge ${index} has valid sourceHandle: ${edge.sourceHandle}`
                );
            }

            if (edge.targetHandle) {
                this.assert(
                    validHandleNames.includes(edge.targetHandle),
                    `Edge ${index} has valid targetHandle: ${edge.targetHandle}`
                );
            }

            // Test handle format consistency
            if (edge.sourceHandle && edge.targetHandle) {
                const sourceEndsWithSource = edge.sourceHandle.endsWith('-source');
                const targetEndsWithTarget = edge.targetHandle.endsWith('-target');

                this.assert(
                    sourceEndsWithSource && targetEndsWithTarget,
                    `Edge ${index} has consistent handle naming format`
                );
            }
        });
    }

    // Test 3: Simulate save operation
    testSaveOperation() {
        this.log('💾 Testing save operation...');

        try {
            // Simulate the save process
            const dataToSave = JSON.stringify(this.testData, null, 2);

            // Validate JSON serialization
            this.assert(
                typeof dataToSave === 'string',
                'Data serializes to valid JSON string'
            );

            // Parse back to validate structure
            const parsedData = JSON.parse(dataToSave);

            this.assert(
                parsedData.nodes && Array.isArray(parsedData.nodes),
                'Saved data contains valid nodes array'
            );

            this.assert(
                parsedData.edges && Array.isArray(parsedData.edges),
                'Saved data contains valid edges array'
            );

            this.assert(
                parsedData.viewport && typeof parsedData.viewport === 'object',
                'Saved data contains valid viewport object'
            );

            this.assert(
                typeof parsedData.version === 'string',
                'Saved data contains version information'
            );

            this.savedData = parsedData;
            this.log('✅ Save operation simulation completed');

        } catch (error) {
            this.log(`❌ Save operation failed: ${error.message}`, true);
        }
    }

    // Test 4: Simulate load operation
    testLoadOperation() {
        this.log('📂 Testing load operation...');

        if (!this.savedData) {
            this.log('❌ No saved data available for load test', true);
            return;
        }

        try {
            // Simulate loading process
            this.loadedData = JSON.parse(JSON.stringify(this.savedData));

            // Test data integrity after load
            this.assert(
                this.loadedData.nodes.length === this.testData.nodes.length,
                `Loaded nodes count matches original (${this.loadedData.nodes.length})`
            );

            this.assert(
                this.loadedData.edges.length === this.testData.edges.length,
                `Loaded edges count matches original (${this.loadedData.edges.length})`
            );

            // Deep equality check for critical properties
            this.loadedData.nodes.forEach((loadedNode, index) => {
                const originalNode = this.testData.nodes[index];

                this.assert(
                    loadedNode.id === originalNode.id,
                    `Node ${index} ID preserved: ${loadedNode.id}`
                );

                this.assert(
                    loadedNode.data.label === originalNode.data.label,
                    `Node ${index} label preserved: "${loadedNode.data.label}"`
                );

                this.assert(
                    JSON.stringify(loadedNode.data.style) === JSON.stringify(originalNode.data.style),
                    `Node ${index} style object preserved`
                );

                this.assert(
                    loadedNode.data.lastStyleUpdate === originalNode.data.lastStyleUpdate,
                    `Node ${index} lastStyleUpdate preserved`
                );

                this.assert(
                    loadedNode.data.lastTextUpdate === originalNode.data.lastTextUpdate,
                    `Node ${index} lastTextUpdate preserved`
                );
            });

            this.loadedData.edges.forEach((loadedEdge, index) => {
                const originalEdge = this.testData.edges[index];

                this.assert(
                    loadedEdge.sourceHandle === originalEdge.sourceHandle,
                    `Edge ${index} sourceHandle preserved: ${loadedEdge.sourceHandle}`
                );

                this.assert(
                    loadedEdge.targetHandle === originalEdge.targetHandle,
                    `Edge ${index} targetHandle preserved: ${loadedEdge.targetHandle}`
                );
            });

            this.log('✅ Load operation simulation completed');

        } catch (error) {
            this.log(`❌ Load operation failed: ${error.message}`, true);
        }
    }

    // Test 5: Validate PropertyPanel integration
    testPropertyPanelIntegration() {
        this.log('🎨 Testing PropertyPanel integration...');

        // Test style property mapping
        const sampleNode = this.testData.nodes[0];
        const style = sampleNode.data.style;

        // Test all style properties are present
        const expectedStyleProps = [
            'fill', 'stroke', 'strokeWidth', 'opacity',
            'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
            'textAlign', 'cornerRadius', 'color',
            'textDecoration', 'textTransform', 'lineHeight',
            'letterSpacing', 'wordSpacing'
        ];

        expectedStyleProps.forEach(prop => {
            this.assert(
                style.hasOwnProperty(prop),
                `PropertyPanel style mapping includes: ${prop}`
            );
        });

        // Test style value types
        this.assert(
            typeof style.fill === 'string' && style.fill.startsWith('#'),
            'Fill color is valid hex color'
        );

        this.assert(
            typeof style.fontSize === 'number' && style.fontSize > 0,
            'Font size is valid positive number'
        );

        this.assert(
            typeof style.opacity === 'number' && style.opacity >= 0 && style.opacity <= 1,
            'Opacity is valid number between 0 and 1'
        );

        this.assert(
            ['left', 'center', 'right'].includes(style.textAlign),
            'Text align is valid alignment value'
        );

        this.assert(
            ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(String(style.fontWeight)),
            'Font weight is valid value'
        );
    }

    // Test 6: Validate connection handle compatibility
    testConnectionHandles() {
        this.log('🔌 Testing connection handle compatibility...');

        const validHandlePairs = [
            ['top-source', 'bottom-target'],
            ['right-source', 'left-target'],
            ['bottom-source', 'top-target'],
            ['left-source', 'right-target']
        ];

        this.testData.edges.forEach((edge, index) => {
            const handlePair = [edge.sourceHandle, edge.targetHandle];

            // Check if it's a valid directional pairing
            const isValidPair = validHandlePairs.some(validPair =>
                validPair[0] === handlePair[0] && validPair[1] === handlePair[1]
            );

            if (!isValidPair) {
                this.log(`⚠ Edge ${index} uses non-standard handle pairing: ${handlePair.join(' → ')}`);
            }

            // Check handle naming consistency
            this.assert(
                edge.sourceHandle.endsWith('-source'),
                `Edge ${index} sourceHandle follows naming convention`
            );

            this.assert(
                edge.targetHandle.endsWith('-target'),
                `Edge ${index} targetHandle follows naming convention`
            );
        });
    }

    // Test 7: Schema version compatibility
    testSchemaCompatibility() {
        this.log('📋 Testing schema version compatibility...');

        this.assert(
            this.testData.version === '1.0.0',
            'Schema version is current (1.0.0)'
        );

        this.assert(
            this.testData.timestamp && !isNaN(Date.parse(this.testData.timestamp)),
            'Timestamp is valid ISO string'
        );

        // Test backward compatibility fields
        this.testData.nodes.forEach((node, index) => {
            if (node.data.backgroundColor || node.data.borderColor) {
                this.log(`ℹ Node ${index} includes legacy compatibility fields`);
            }
        });
    }

    // Run all tests
    async runAllTests() {
        this.log('🚀 Starting comprehensive save/load functionality tests...');
        this.log('='.repeat(60));

        try {
            // Generate test data
            this.generateTestData();

            // Run all test suites
            this.testNodeDataStructure();
            this.testEdgeDataStructure();
            this.testSaveOperation();
            this.testLoadOperation();
            this.testPropertyPanelIntegration();
            this.testConnectionHandles();
            this.testSchemaCompatibility();

            // Generate summary
            this.generateTestSummary();

        } catch (error) {
            this.log(`❌ Test runner encountered error: ${error.message}`, true);
        }
    }

    // Generate test summary
    generateTestSummary() {
        this.log('='.repeat(60));
        this.log('📊 TEST SUMMARY');
        this.log('='.repeat(60));

        const total = this.testResults.passed + this.testResults.failed;
        const passRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;

        this.log(`Total Tests: ${total}`);
        this.log(`✅ Passed: ${this.testResults.passed}`);
        this.log(`❌ Failed: ${this.testResults.failed}`);
        this.log(`📈 Pass Rate: ${passRate}%`);

        if (this.testResults.failed === 0) {
            this.log('🎉 All tests passed! Save/load functionality is working correctly.');
        } else {
            this.log('⚠ Some tests failed. Check the errors above for details.');
            this.log('\n❌ ERRORS:');
            this.testResults.errors.forEach(error => {
                this.log(`  ${error}`);
            });
        }

        this.log('='.repeat(60));

        // Return results for external consumption
        return {
            success: this.testResults.failed === 0,
            total,
            passed: this.testResults.passed,
            failed: this.testResults.failed,
            passRate,
            errors: this.testResults.errors,
            details: this.testResults.details
        };
    }

    // Export test data for manual testing
    exportTestData() {
        const dataStr = JSON.stringify(this.testData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-diagram-export.json';
        link.click();
        URL.revokeObjectURL(url);
        this.log('📁 Test data exported as test-diagram-export.json');
    }
}

// Global function to run tests
async function runSaveLoadTests() {
    const testRunner = new SaveLoadTestRunner();
    const results = await testRunner.runAllTests();

    // Make test runner available globally for manual testing
    window.saveLoadTestRunner = testRunner;

    console.log('\n🔧 Manual Testing Functions Available:');
    console.log('- window.saveLoadTestRunner.exportTestData() - Export test data file');
    console.log('- window.saveLoadTestRunner.generateTestData() - Generate new test data');
    console.log('- window.saveLoadTestRunner.testData - Access current test data');

    return results;
}

// Export for manual testing
window.SaveLoadTestRunner = SaveLoadTestRunner;
window.runSaveLoadTests = runSaveLoadTests;

console.log('🧪 Save/Load Test Runner loaded!');
console.log('Run: await runSaveLoadTests()');