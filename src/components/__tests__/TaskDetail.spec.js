import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TaskDetails from '../TaskDetails.vue';
import Map from '../Map.vue';

describe('TaskDetails.vue', () => {
    const props = {
        taskName: 'Sample Task',
        startDateTime: '2024-11-01T10:00',
        endDateTime: '2024-11-01T14:00',
        location: 'Sample Location',
        description: 'This is a sample task description.',
        location_lat: 40.7128,
        location_lng: -74.006,
        requirements: ['Requirement 1', 'Requirement 2'],
        sessions: ['Session 1', 'Session 2']
    };

    it('Renders task name, description, requirements, and dates', () => {
        const wrapper = mount(TaskDetails, { props });
        
        expect(wrapper.text()).toContain(props.taskName);
        expect(wrapper.text()).toContain(props.description);
        expect(wrapper.text()).toContain(`Requirements: ${props.requirements.join(', ')}`);
        expect(wrapper.text()).toContain(`Start Date: ${props.startDateTime}`);
        expect(wrapper.text()).toContain(`End Date: ${props.endDateTime}`);
    });

    it('Conditionally renders location and Map component', () => {
        const wrapper = mount(TaskDetails, { props });

        expect(wrapper.text()).toContain(`Location: ${props.location}`);
        
        const mapComponent = wrapper.findComponent(Map);
        expect(mapComponent.exists()).toBe(true);
        expect(mapComponent.props('location')).toEqual({
            lat: props.location_lat,
            lng: props.location_lng
        });
    });

    it('Conditionally renders session cards slot if sessions are present', () => {
        const wrapper = mount(TaskDetails, {
            props,
            slots: {
                'session-cards': '<div class="session-card">Session Content</div>'
            }
        });
        
        const sessionCards = wrapper.findAll('.session-card');
        expect(sessionCards.length).toBeGreaterThan(0);
        sessionCards.forEach(card => expect(card.text()).toBe('Session Content'));
    });
});