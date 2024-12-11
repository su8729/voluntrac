import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Map from '../Map.vue';
import loader from '../../google_setup';

vi.mock("../../google_setup", () => ({
    default: {
      load: vi.fn(() => Promise.resolve()),
    },
}));
  
global.google = {
    maps: {
        Map: vi.fn().mockImplementation(() => ({
            setCenter: vi.fn(),
            setZoom: vi.fn(),
        })),
        Marker: vi.fn().mockImplementation(() => ({
            setPosition: vi.fn(),
            setMap: vi.fn(),
        })),
    },
};
  
    describe('Map.vue', () => {
        it('Renders the map and places a marker', async () => {
        const location = { lat: 40.7128, lng: -74.0060 }; 
        const wrapper = mount(Map, {
            props: {
                location,
            },
        });
    
        await flushPromises();

        expect(google.maps.Map).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining({
                center: { lat: location.lat, lng: location.lng },
                zoom: 15,
            })
        );

        expect(google.maps.Marker).toHaveBeenCalledWith(
            expect.objectContaining({
                position: { lat: location.lat, lng: location.lng },
                map: expect.anything(),
            })
        );
    });
});  