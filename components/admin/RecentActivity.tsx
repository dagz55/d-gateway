'use client';

const activities = [
  {
    type: 'user',
    description: 'New user registration: john.doe@example.com',
    color: 'bg-green-400',
    time: '2 mins ago',
    icon: '👤'
  },
  {
    type: 'signal',
    description: 'Signal generated for BTC/USD',
    color: 'bg-blue-400',
    time: '5 mins ago',
    icon: '📊'
  },
  {
    type: 'system',
    description: 'System maintenance completed',
    color: 'bg-yellow-400',
    time: '15 mins ago',
    icon: '⚙️'
  },
  {
    type: 'trade',
    description: 'New trade executed: ETH/USD',
    color: 'bg-purple-400',
    time: '23 mins ago',
    icon: '💰'
  },
  {
    type: 'alert',
    description: 'Price alert triggered: BTC > $50K',
    color: 'bg-orange-400',
    time: '45 mins ago',
    icon: '🚨'
  }
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="glass-subtle p-4 rounded-xl group hover:glass-light transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center space-x-4">
            {/* Icon and indicator */}
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 ${activity.color}/20 rounded-xl flex items-center justify-center`}>
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${activity.color} rounded-full animate-pulse border border-background`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90 font-medium leading-relaxed group-hover:text-white transition-colors">
                {activity.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-1 h-1 ${activity.color} rounded-full`} />
                <span className="text-xs text-white/50 font-medium">{activity.time}</span>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-6 h-6 glass-subtle rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-accent/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* View more button */}
      <div className="pt-4">
        <button className="w-full glass-subtle p-3 rounded-xl text-sm text-white/70 hover:text-white font-medium transition-all duration-300 hover:glass-light group">
          <div className="flex items-center justify-center space-x-2">
            <span>View All Activity</span>
            <div className="w-4 h-4 bg-accent/40 rounded-full flex items-center justify-center group-hover:bg-accent/60 transition-colors">
              <span className="text-xs">→</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
