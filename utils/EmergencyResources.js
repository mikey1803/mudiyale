// utils/EmergencyResources.js - Location-based crisis support finder for India

// Note: Location services removed for Expo Go compatibility
// Using fallback location detection based on user input

export class EmergencyResourceFinder {
  constructor() {
    this.userLocation = null;
    this.lastLocationUpdate = null;
  }

  // Get user's location (simplified for Expo Go compatibility)
  async getCurrentLocation() {
    try {
      console.log('📍 Using fallback location detection...');
      
      // For now, return a default location (Tamil Nadu, India)
      // This ensures the crisis system works even without precise location
      this.userLocation = {
        latitude: 13.0827, // Chennai, Tamil Nadu
        longitude: 80.2707,
        timestamp: new Date(),
        isApproximate: true
      };

      console.log('📍 Fallback location set (Tamil Nadu, India)');
      return this.userLocation;
      
    } catch (error) {
      console.error('📍 Location error:', error);
      throw error;
    }
  }

  // Database of crisis centers - Indian Mental Health Resources
  getCrisisCentersDatabase() {
    return [
      // National Indian Crisis Centers
      {
        id: 'national_kiran',
        name: 'KIRAN Mental Health Helpline',
        type: 'hotline',
        phone: '1800-599-0019',
        description: '24/7 toll-free mental health support by Ministry of Health, Government of India',
        availability: '24/7',
        services: ['suicide prevention', 'crisis counseling', 'emotional support'],
        coverage: 'national',
        priority: 1
      },
      {
        id: 'vandrevala',
        name: 'Vandrevala Foundation Helpline',
        type: 'hotline',
        phone: '1860-266-2345',
        description: '24/7 free crisis support and mental health counseling',
        availability: '24/7',
        services: ['crisis counseling', 'suicide prevention', 'emotional support'],
        coverage: 'national',
        priority: 1
      },
      {
        id: 'aasra',
        name: 'AASRA Suicide Prevention Helpline',
        type: 'hotline',
        phone: '91-22-27546669',
        description: '24/7 crisis helpline for suicide prevention',
        availability: '24/7',
        services: ['suicide prevention', 'crisis support'],
        coverage: 'national',
        priority: 1
      },
      {
        id: 'sneha_india',
        name: 'SNEHA India',
        type: 'hotline',
        phone: '044-24640050',
        description: 'Emotional support helpline based in Chennai',
        availability: '24/7',
        services: ['emotional support', 'crisis counseling'],
        coverage: 'national',
        priority: 1
      },

      // Tamil Nadu Specific Resources
      {
        id: 'tn_health_helpline',
        name: 'Tamil Nadu Health Helpline',
        type: 'hotline',
        phone: '104',
        description: 'Government health helpline including mental health support',
        availability: '24/7',
        services: ['health information', 'mental health support', 'referrals'],
        coverage: 'tamil_nadu',
        latitude: 13.0827,
        longitude: 80.2707,
        priority: 1
      },
      {
        id: 'chennai_sneha',
        name: 'SNEHA Chennai',
        type: 'center',
        phone: '044-24640050',
        address: '11, Park View Road, R A Puram, Chennai - 600028',
        latitude: 13.0338,
        longitude: 80.2518,
        description: 'Suicide prevention center in Chennai',
        availability: '24/7',
        services: ['crisis intervention', 'suicide prevention', 'face-to-face counseling'],
        coverage: 'chennai',
        priority: 2
      },
      {
        id: 'scarf_chennai',
        name: 'SCARF (Schizophrenia Research Foundation)',
        type: 'center',
        phone: '044-26251500',
        address: 'R/7A, North Main Road, Anna Nagar West Extension, Chennai - 600101',
        latitude: 13.0878,
        longitude: 80.2085,
        description: 'Mental health center in Chennai',
        availability: 'Mon-Sat 9am-5pm',
        services: ['mental health services', 'counseling', 'psychiatric care'],
        coverage: 'chennai',
        priority: 2
      },
      {
        id: 'fortis_chennai',
        name: 'Fortis Malar Hospital - Mental Health',
        type: 'hospital',
        phone: '044-42892222',
        address: '52, 1st Main Road, Gandhi Nagar, Adyar, Chennai - 600020',
        latitude: 13.0067,
        longitude: 80.2548,
        description: 'Mental health emergency services',
        availability: '24/7',
        services: ['emergency mental health', 'psychiatric care', 'crisis intervention'],
        coverage: 'chennai',
        priority: 2
      },
      {
        id: 'mitram',
        name: 'Mitram Foundation',
        type: 'hotline',
        phone: '080-25722573',
        description: 'Mental health support and suicide prevention',
        availability: '10am-8pm',
        services: ['counseling', 'suicide prevention'],
        coverage: 'south_india',
        priority: 2
      },
      {
        id: 'parivarthan',
        name: 'Parivarthan Counseling Center',
        type: 'hotline',
        phone: '7676602602',
        description: 'Professional counseling services',
        availability: '9am-9pm',
        services: ['counseling', 'mental health support'],
        coverage: 'karnataka_tn',
        priority: 2
      }
    ];
  }

  // Calculate distance between two coordinates (in kilometers)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Find crisis resources (prioritizing national resources for broad compatibility)
  async findNearbyResources(crisisLevel = 'moderate') {
    try {
      console.log('🔍 Finding crisis resources...');
      
      const crisisCenters = this.getCrisisCentersDatabase();
      const availableResources = [];

      // Prioritize national resources that work everywhere
      crisisCenters.forEach(center => {
        let resource = { ...center };
        
        // National resources are always available and most important
        if (center.coverage === 'national') {
          resource.distance = 0;
          resource.availability_note = 'Available across India - Call anytime';
          availableResources.push(resource);
        }
        // Include regional resources as additional options
        else {
          resource.distance = 0;
          resource.availability_note = 'Regional support available';
          availableResources.push(resource);
        }
      });

      // Sort by priority (national first, then regional)
      availableResources.sort((a, b) => {
        if (a.coverage === 'national' && b.coverage !== 'national') return -1;
        if (b.coverage === 'national' && a.coverage !== 'national') return 1;
        return a.priority - b.priority;
      });

      console.log('🔍 Found resources:', availableResources.length);
      return this.formatResourcesForCrisisLevel(availableResources, crisisLevel);
      
    } catch (error) {
      console.error('🔍 Error finding resources:', error);
      return this.getFallbackResources(crisisLevel);
    }
  }

  // Format resources based on crisis level
  formatResourcesForCrisisLevel(resources, crisisLevel) {
    const formatted = {
      immediate: [],
      professional: [],
      support: []
    };

    resources.forEach(resource => {
      if (resource.coverage === 'national' || resource.distance <= 50) {
        if (resource.type === 'hotline' || resource.type === 'text') {
          formatted.immediate.push(resource);
        } else if (resource.type === 'center' || resource.type === 'hospital') {
          formatted.professional.push(resource);
        } else {
          formatted.support.push(resource);
        }
      }
    });

    return formatted;
  }

  // Fallback resources when location is unavailable
  getFallbackResources(crisisLevel) {
    return {
      immediate: [
        {
          name: 'KIRAN Mental Health Helpline',
          phone: '1800-599-0019',
          description: '24/7 toll-free mental health support - Government of India',
          availability: '24/7',
          type: 'hotline'
        },
        {
          name: 'Vandrevala Foundation',
          phone: '1860-266-2345',
          description: '24/7 free crisis support and counseling',
          availability: '24/7',
          type: 'hotline'
        },
        {
          name: 'SNEHA India (Chennai)',
          phone: '044-24640050',
          description: '24/7 emotional support helpline',
          availability: '24/7',
          type: 'hotline'
        }
      ],
      professional: [
        {
          name: 'Emergency Services',
          phone: '112',
          description: 'For immediate medical emergencies (National Emergency Number)',
          availability: '24/7',
          type: 'emergency'
        },
        {
          name: 'Tamil Nadu Health Helpline',
          phone: '104',
          description: 'Health information and mental health support',
          availability: '24/7',
          type: 'helpline'
        },
        {
          name: 'AASRA Suicide Prevention',
          phone: '91-22-27546669',
          description: '24/7 crisis helpline for suicide prevention',
          availability: '24/7',
          type: 'helpline'
        }
      ],
      support: []
    };
  }

  // Generate formatted crisis response with nearby resources
  generateLocationBasedCrisisResponse(resources, crisisLevel) {
    let response = '';
    
    if (crisisLevel === 'immediate') {
      response += `🚨 **IMMEDIATE HELP AVAILABLE** 🚨\n\n`;
      response += `**CALL NOW - Don't wait:**\n`;
    } else if (crisisLevel === 'high') {
      response += `💙 **Crisis Support Near You** 💙\n\n`;
      response += `**24/7 Crisis Help:**\n`;
    } else {
      response += `🤝 **Support Resources Available** 🤝\n\n`;
      response += `**Professional Support:**\n`;
    }

    // Add immediate help resources
    if (resources.immediate && resources.immediate.length > 0) {
      resources.immediate.slice(0, 3).forEach(resource => {
        response += `📞 **${resource.name}**\n`;
        if (resource.type === 'text' && resource.textCode) {
          response += `   Text "${resource.textCode}" to ${resource.phone}\n`;
        } else {
          response += `   Call: ${resource.phone}\n`;
        }
        response += `   ${resource.description}\n`;
        if (resource.availability_note) {
          response += `   ${resource.availability_note}\n`;
        }
        response += `\n`;
      });
    }

    // Add professional resources
    if (resources.professional && resources.professional.length > 0) {
      response += `\n🏥 **Professional Help:**\n`;
      resources.professional.slice(0, 2).forEach(resource => {
        response += `• **${resource.name}**: ${resource.phone}\n`;
        response += `  ${resource.description}\n`;
        if (resource.distance && resource.distance > 0) {
          response += `  Distance: ${resource.distance} km\n`;
        }
        response += `\n`;
      });
    }

    if (crisisLevel === 'immediate') {
      response += `\n🆘 **If you're in immediate danger, call 112 (National Emergency)**\n`;
      response += `💙 **Your life has value. Help is available right now.**`;
    }

    return response;
  }
}

// Export singleton instance
export const emergencyResourceFinder = new EmergencyResourceFinder();