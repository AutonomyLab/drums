import os

try:
    from setuptools.core import setup
except ImportError:
    from distutils.core import setup

def get_version():
    INIT = os.path.abspath(os.path.join(os.path.dirname(__file__), 'drumspy', '__init__.py'))
    f = open(INIT, 'r')
    try:
        for line in f:
            if line.startswith('__version__'):
                ret = eval(line.strip().split(' = ')[1])
                assert ret.count('.') == 2, ret
                for num in ret.split('.'):
                    assert num.isdigit(), ret
                return ret
        else:
            raise ValueError("couldn't find version string")
    finally:
        f.close()

VERSION = get_version()

setup(
    name = 'drumspy',
    version = VERSION,
    author = 'Mani Monajjemi',
    author_email = 'TODO',
    packages = ['drumspy'],
    url = 'TODO',
    license = 'LICENSE',
    install_requires = ['requests', 'pyzmq >= 2.2', 'msgpack-python', 'ws4py'],
    description = 'TODO',
    scripts = [],
    test_suite = ''
)