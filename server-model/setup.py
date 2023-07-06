from setuptools import setup, find_packages

setup(
   name='unit-test-gen-cli',
   version='0.1',
   packages=find_packages(),
   install_requires=[
      'pydantic',
      'requests',
      'tqdm'
   ],
   entry_points='''
      [console_scripts]
      cli_utility=server-model.cli_utility:read_files
      ''',
)