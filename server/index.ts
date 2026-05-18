import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const attractions = [
  {
    id: '1',
    name: '故宫博物院',
    description: '中国明清两代的皇家宫殿，世界文化遗产',
    address: '北京市东城区景山前街4号',
    latitude: 39.9163,
    longitude: 116.3972,
    rating: 4.8,
    category: '历史文化',
    image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
    tags: ['世界遗产', '博物馆', '皇家宫殿']
  },
  {
    id: '2',
    name: '天坛公园',
    description: '明清两代皇帝祭天祈谷的场所',
    address: '北京市东城区天坛路甲1号',
    latitude: 39.8822,
    longitude: 116.4066,
    rating: 4.7,
    category: '历史文化',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    tags: ['世界遗产', '公园', '古建筑']
  },
  {
    id: '3',
    name: '颐和园',
    description: '中国现存规模最大、保存最完整的皇家园林',
    address: '北京市海淀区新建宫门路19号',
    latitude: 39.9999,
    longitude: 116.2755,
    rating: 4.6,
    category: '自然风光',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
    tags: ['世界遗产', '园林', '湖泊']
  },
  {
    id: '4',
    name: '长城',
    description: '中国古代的军事防御工程，世界文化遗产',
    address: '北京市延庆区八达岭镇',
    latitude: 40.3584,
    longitude: 116.0171,
    rating: 4.9,
    category: '历史文化',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    tags: ['世界遗产', '长城', '军事建筑']
  },
  {
    id: '5',
    name: '西湖',
    description: '中国著名的风景名胜区，世界文化遗产',
    address: '浙江省杭州市西湖区',
    latitude: 30.2592,
    longitude: 120.1394,
    rating: 4.8,
    category: '自然风光',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tags: ['世界遗产', '湖泊', '园林']
  },
  {
    id: '6',
    name: '兵马俑',
    description: '秦始皇陵的陪葬坑，世界文化遗产',
    address: '陕西省西安市临潼区',
    latitude: 34.3841,
    longitude: 109.2785,
    rating: 4.9,
    category: '历史文化',
    image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
    tags: ['世界遗产', '博物馆', '考古']
  },
  {
    id: '7',
    name: '黄山',
    description: '中国著名的风景名胜区，世界文化与自然双重遗产',
    address: '安徽省黄山市',
    latitude: 30.1319,
    longitude: 118.1677,
    rating: 4.7,
    category: '自然风光',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    tags: ['世界遗产', '山岳', '云海']
  },
  {
    id: '8',
    name: '九寨沟',
    description: '中国著名的自然保护区，世界自然遗产',
    address: '四川省阿坝藏族羌族自治州九寨沟县',
    latitude: 33.1605,
    longitude: 103.9171,
    rating: 4.8,
    category: '自然风光',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    tags: ['世界遗产', '自然保护区', '湖泊']
  },
  {
    id: '9',
    name: '张家界',
    description: '中国著名的风景名胜区，世界自然遗产',
    address: '湖南省张家界市',
    latitude: 29.1251,
    longitude: 110.4792,
    rating: 4.6,
    category: '自然风光',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    tags: ['世界遗产', '山岳', '森林']
  },
  {
    id: '10',
    name: '布达拉宫',
    description: '西藏著名的宫殿建筑，世界文化遗产',
    address: '西藏自治区拉萨市城关区',
    latitude: 29.6575,
    longitude: 91.1172,
    rating: 4.9,
    category: '历史文化',
    image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
    tags: ['世界遗产', '宫殿', '宗教建筑']
  }
];

app.get('/api/attractions', (req, res) => {
  const { query, category, lat, lng, radius } = req.query;
  
  let filteredAttractions = attractions;

  if (query) {
    const searchQuery = query.toString().toLowerCase();
    filteredAttractions = filteredAttractions.filter(attraction =>
      attraction.name.toLowerCase().includes(searchQuery) ||
      attraction.description.toLowerCase().includes(searchQuery) ||
      attraction.address.toLowerCase().includes(searchQuery) ||
      attraction.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  if (category && category !== 'all') {
    filteredAttractions = filteredAttractions.filter(
      attraction => attraction.category === category
    );
  }

  if (lat && lng && radius) {
    const userLat = parseFloat(lat.toString());
    const userLng = parseFloat(lng.toString());
    const radiusKm = parseFloat(radius.toString());

    filteredAttractions = filteredAttractions.filter(attraction => {
      const distance = calculateDistance(
        userLat,
        userLng,
        attraction.latitude,
        attraction.longitude
      );
      return distance <= radiusKm;
    });
  }

  res.json({
    success: true,
    data: filteredAttractions,
    total: filteredAttractions.length
  });
});

app.get('/api/attractions/popular', (req, res) => {
  const popularAttractions = attractions
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  res.json({
    success: true,
    data: popularAttractions
  });
});

app.get('/api/attractions/:id', (req, res) => {
  const attraction = attractions.find(a => a.id === req.params.id);
  
  if (!attraction) {
    return res.status(404).json({
      success: false,
      message: '景点不存在'
    });
  }

  res.json({
    success: true,
    data: attraction
  });
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'all', name: '全部' },
    { id: '历史文化', name: '历史文化' },
    { id: '自然风光', name: '自然风光' },
    { id: '现代都市', name: '现代都市' },
    { id: '民俗风情', name: '民俗风情' }
  ];

  res.json({
    success: true,
    data: categories
  });
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});