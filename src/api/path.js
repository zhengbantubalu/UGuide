import axios from 'axios';

export const pathPlanMulti = async (names) => {
    try {
        const requestData = {
            "start": {
                "name": names[0],
            },
            "destinations": names.slice(1).map(name => ({ "name": name }))
        };

        const response = await axios.post('/api/arith/path/multi', requestData);

        return {
            path: response.data.path.map(point => [point.longitude, point.latitude]),
            distance: response.data.distance,
            visitOrder: response.data.visit_order
        };
    } catch (error) {
        console.error('路径规划API请求失败:', error);
        return [];
    }
};