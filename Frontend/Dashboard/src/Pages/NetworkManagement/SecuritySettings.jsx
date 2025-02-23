import React, { useState } from 'react'
import WiFiAccessControl from '../../components/WiFiAccessControl'
import SecurityTips from '../../components/SecurityTips'

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    firewall: null,
    vpn: null,
    ports: null,
    guestNetwork: null,
    twoFactorAuth: false, // New: Two-Factor Authentication
    softwareUpdates: null, // New: Software Update Status
    dnsEncryption: 'Disabled', // New: DNS Encryption
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceLimit, setDeviceLimit] = useState(2); // Device limit based on user's plan
  const [registeredDevices, setRegisteredDevices] = useState([]);

  const configureSettings = () => {
    setLoading(true);
    setError(null);

    // Mock responses for new settings
    const mockFirewallResponse = {
      status: 'Firewall configured successfully',
      rules: [
        { type: 'Block', ip: '192.168.1.10', description: 'Blocked malicious IP' },
        { type: 'Allow', ip: '192.168.1.20', description: 'Trusted device' },
      ],
    };

    const mockVPNResponse = {
      status: 'VPN connected',
      server: 'vpn.starlink.com',
      connectionTime: '2024-11-20 10:30:00',
    };

    const mockPortsResponse = {
      status: 'Port settings updated',
      openPorts: [
        { port: 80, service: 'HTTP' },
        { port: 443, service: 'HTTPS' },
        { port: 22, service: 'SSH' },
      ],
    };

    const mockGuestNetworkResponse = {
      status: 'Guest network configured',
      networkName: 'Guest_WiFi',
      isolation: true,
    };

    const mock2FAResponse = {
      status: '2FA Enabled',
      method: 'SMS',
    };

    const mockSoftwareUpdates = {
      status: 'All systems up to date',
      lastUpdated: '2024-11-15',
    };

    const mockDNSEncryption = {
      status: 'DNS Encryption Enabled',
      protocol: 'DoH',
    };

    // Simulating API response delay
    setTimeout(() => {
      setSettings({
        firewall: mockFirewallResponse,
        vpn: mockVPNResponse,
        ports: mockPortsResponse,
        guestNetwork: mockGuestNetworkResponse,
        twoFactorAuth: mock2FAResponse,
        softwareUpdates: mockSoftwareUpdates,
        dnsEncryption: mockDNSEncryption,
      });
      setLoading(false);
    }, 2000);
  };

  const registerDevice = (macAddress) => {
    if (registeredDevices.length < deviceLimit) {
      setRegisteredDevices([...registeredDevices, macAddress]);
    } else {
      alert('You have reached your device limit.');
    }
  };

  const removeDevice = (macAddress) => {
    setRegisteredDevices(registeredDevices.filter(device => device !== macAddress));
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        onClick={configureSettings}
        disabled={loading}
      >
        {loading ? 'Configuring Settings...' : 'Configure Security'}
      </button>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      <div className="mt-8 space-y-6">
        {/* Firewall Configuration */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Firewall Configuration</h3>
          {settings.firewall ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.firewall.status}</p>
              <ul className="mt-4 space-y-2">
                {settings.firewall.rules.map((rule, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-md ${rule.type === 'Block' ? 'bg-red-100' : 'bg-green-100'
                      }`}
                  >
                    <div>
                      <p className="font-medium">
                        {rule.type}: {rule.ip}
                      </p>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* VPN Configuration */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">VPN Configuration</h3>
          {settings.vpn ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.vpn.status}</p>
              <p className="mt-2 text-gray-700">
                Server: <span className="font-medium">{settings.vpn.server}</span>
              </p>
              <p className="mt-1 text-gray-700">
                Connected Since: <span className="font-medium">{settings.vpn.connectionTime}</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* Port Management */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Port Management</h3>
          {settings.ports ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.ports.status}</p>
              <table className="mt-4 w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-3 border-b">Port</th>
                    <th className="py-2 px-3 border-b">Service</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.ports.openPorts.map((port, index) => (
                    <tr key={index}>
                      <td className="py-2 px-3 border-b">{port.port}</td>
                      <td className="py-2 px-3 border-b">{port.service}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* Guest Network */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Guest Network</h3>
          {settings.guestNetwork ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.guestNetwork.status}</p>
              <p>Network Name: {settings.guestNetwork.networkName}</p>
              <p>Isolation: {settings.guestNetwork.isolation ? 'Enabled' : 'Disabled'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Two-Factor Authentication</h3>
          {settings.twoFactorAuth ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.twoFactorAuth.status}</p>
              <p>Method: {settings.twoFactorAuth.method}</p>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* Software Updates */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Software Updates</h3>
          {settings.softwareUpdates ? (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-green-600 font-medium">{settings.softwareUpdates.status}</p>
              <p>Last Updated: {settings.softwareUpdates.lastUpdated}</p>
            </div>
          ) : (
            <p className="text-gray-500">No data yet.</p>
          )}
        </div>

        {/* DNS Encryption */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700">DNS Encryption</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
            <p className="text-green-600 font-medium">Status: {settings.dnsEncryption.status}</p>
            <p>Protocol: {settings.dnsEncryption.protocol || 'Not set'}</p>
          </div>
        </div>

        {/* WiFi Access Control */}
        <WiFiAccessControl
          deviceLimit={deviceLimit}
          registeredDevices={registeredDevices}
          registerDevice={registerDevice}
          removeDevice={removeDevice}
        />

        {/* Security Tips */}
        <SecurityTips />
      </div>
    </div>
  );
};

export default SecuritySettings;