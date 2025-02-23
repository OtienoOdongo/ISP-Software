import React from 'react';

const SecurityTips = () => {
    const tips = [
        {
            title: 'Use Strong Passwords',
            content: 'Always use complex passwords with a mix of letters, numbers, and special characters. Change them regularly and never reuse passwords across different services.'
        },
        {
            title: 'Enable Two-Factor Authentication',
            content: 'Whenever possible, enable 2FA for your accounts. This adds an extra layer of security by requiring a second form of verification beyond just your password.'
        },
        {
            title: 'Keep Software Updated',
            content: 'Regularly update your router firmware, operating systems, and all software. Updates often include critical security patches.'
        },
        {
            title: 'Secure Your Wi-Fi Network',
            content: 'Change the default SSID and password, use WPA3 encryption if available, and consider hiding your network name (SSID).'
        },
        {
            title: 'Limit Device Connections',
            content: 'Only allow devices you trust to connect to your network. Use MAC address filtering to control which devices can connect.'
        },
        {
            title: 'Monitor Network Activity',
            content: 'Keep an eye on who or what is accessing your network. Use network monitoring tools to detect unusual activity.'
        },
        {
            title: 'Use a VPN',
            content: 'Encrypt your internet traffic with a VPN, especially on public Wi-Fi, to protect your data from prying eyes.'
        },
        {
            title: 'Disable Remote Management',
            content: 'If you don\'t need remote access to your router, disable this feature to reduce exposure to external threats.'
        },
        {
            title: 'Educate Yourself About Phishing',
            content: 'Be wary of emails or messages asking for personal information. Learn to recognize and avoid phishing attempts.'
        },
        {
            title: 'Backup Important Data',
            content: 'Regularly backup your data. In case of a security breach or hardware failure, you can recover your information.'
        },
    ];

    return (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Tips</h3>
            <div className="space-y-4">
                {tips.map((tip, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                        <h4 className="text-lg font-medium text-blue-700">{tip.title}</h4>
                        <p className="text-gray-700 text-sm">{tip.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityTips;